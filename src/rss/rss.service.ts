import { Channel, Connection, connect } from 'amqplib';
import { Pool } from 'pg';
import { ConfigService } from '../config.service';
import { RssFeedMetadata } from './rssFeedMetadata.interface';

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
