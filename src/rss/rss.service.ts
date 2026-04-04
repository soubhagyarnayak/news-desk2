import { Channel, Connection, connect } from 'amqplib';
import { Pool } from 'pg';
import { ConfigService } from '../config.service';
import { RssFeedMetadata } from './rssFeedMetadata.interface';
import { RssFeedEntry, RssFeedEntriesResult } from './rssFeedEntry.interface';

export class RssService {
  private pool: Pool;
  private queueConnectionString: string;

  constructor(config: ConfigService) {
    this.pool = config.getPool();
    this.queueConnectionString = config.get('QUEUE_CONNECTION_STRING');
  }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS RSSFeedMetadata (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS RSSFeedEntries (
        id SERIAL PRIMARY KEY,
        feed_id INTEGER NOT NULL REFERENCES RSSFeedMetadata(id),
        title TEXT,
        link TEXT UNIQUE,
        description TEXT,
        guid TEXT,
        publication_date TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await this.pool.query(`ALTER TABLE RSSFeedEntries ADD COLUMN IF NOT EXISTS is_read BOOLEAN`);
    await this.pool.query(`ALTER TABLE RSSFeedEntries ADD COLUMN IF NOT EXISTS is_removed BOOLEAN`);
    await this.pool.query(`ALTER TABLE RSSFeedEntries ADD COLUMN IF NOT EXISTS tags TEXT`);
    await this.pool.query(`ALTER TABLE RSSFeedEntries ADD COLUMN IF NOT EXISTS notes TEXT`);
  }

  async createFeed(url: string, title: string, description?: string): Promise<RssFeedMetadata> {
    const result = await this.pool.query(
      'INSERT INTO RSSFeedMetadata (url, title, description) VALUES ($1, $2, $3) RETURNING *',
      [url, title, description || null],
    );
    const row = result.rows[0];
    return { id: row.id, url: row.url, title: row.title, description: row.description, createdAt: row.created_at };
  }

  async getAllFeeds(): Promise<RssFeedMetadata[]> {
    const result = await this.pool.query(
      'SELECT id, url, title, description, created_at FROM RSSFeedMetadata ORDER BY created_at DESC',
    );
    return result.rows.map(row => ({
      id: row.id,
      url: row.url,
      title: row.title,
      description: row.description,
      createdAt: row.created_at,
    }));
  }

  async getEntries(): Promise<RssFeedEntriesResult> {
    const result = await this.pool.query(`
      SELECT e.id, e.title, e.link, e.description, e.publication_date, e.feed_id, e.tags, e.notes,
             f.title AS feed_title
      FROM RSSFeedEntries e
      JOIN RSSFeedMetadata f ON e.feed_id = f.id
      WHERE e.is_read IS NULL AND e.is_removed IS NULL
      ORDER BY f.title ASC, e.publication_date DESC NULLS LAST
    `);
    const entriesMap = new Map<string, RssFeedEntry[]>();
    let count = 0;
    for (const row of result.rows) {
      const entry: RssFeedEntry = {
        id: row.id,
        feedId: row.feed_id,
        feedTitle: row.feed_title,
        title: row.title,
        link: row.link,
        description: row.description,
        publicationDate: row.publication_date,
        tags: row.tags,
        notes: row.notes,
      };
      if (!entriesMap.has(row.feed_title)) {
        entriesMap.set(row.feed_title, []);
      }
      entriesMap.get(row.feed_title).push(entry);
      count++;
    }
    return { entries: entriesMap, count };
  }

  async getEntry(id: string): Promise<{ tags: string; notes: string } | null> {
    const result = await this.pool.query(
      'SELECT tags, notes FROM RSSFeedEntries WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    return { tags: result.rows[0].tags, notes: result.rows[0].notes };
  }

  async markEntryRead(id: string): Promise<boolean> {
    return this.updateEntry('UPDATE RSSFeedEntries SET is_read = true WHERE id = $1', [id]);
  }

  async removeEntry(id: string): Promise<boolean> {
    return this.updateEntry('UPDATE RSSFeedEntries SET is_removed = true WHERE id = $1', [id]);
  }

  async annotateEntry(id: string, tags: string, notes: string): Promise<boolean> {
    return this.updateEntry(
      'UPDATE RSSFeedEntries SET tags = $1, notes = $2 WHERE id = $3',
      [tags, notes, id],
    );
  }

  private async updateEntry(query: string, args: string[]): Promise<boolean> {
    try {
      await this.pool.query(query, args);
      return true;
    } catch (error) {
      console.error('Error updating RSS entry:', error);
      return false;
    }
  }

  async enqueueFeedRefresh(feedId: number): Promise<boolean> {
    let connection: Connection, channel: Channel;
    try {
      connection = await connect(this.queueConnectionString);
      channel = await connection.createChannel();
      await channel.sendToQueue(
        'newsparser',
        Buffer.from(`{"command": "refreshRSS", "feedId": ${feedId}}`, 'utf-8'),
      );
    } catch (error) {
      console.log(`Encountered error enqueuing RSS refresh: ${error}`);
      return false;
    } finally {
      await channel.close();
      await connection.close();
    }
    return true;
  }
}
