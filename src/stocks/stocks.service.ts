import axios, { AxiosError } from 'axios';
import { Pool } from 'pg';
import { ConfigService } from '../config.service';
import { StockMetadata } from './stockMetadata.interface';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface AuthSession {
  crumb: string;
  cookies: string;
  expiresAt: number;
}

export class StocksService {
  private pool: Pool;
  private authSession: AuthSession | null = null;

  constructor(config: ConfigService) {
    this.pool = config.getPool();
  }

  async init(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS StockMetadata (
        id                  SERIAL PRIMARY KEY,
        name                TEXT NOT NULL,
        symbol              TEXT NOT NULL UNIQUE,
        country             TEXT,
        value               NUMERIC(15, 4),
        variation           NUMERIC(8, 4),
        last_update_time    TIMESTAMP WITH TIME ZONE,
        last_refreshed_time TIMESTAMP WITH TIME ZONE,
        link                TEXT,
        created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
  }

  async getAllStocks(): Promise<StockMetadata[]> {
    const result = await this.pool.query(
      'SELECT id, name, symbol, country, value, variation, last_update_time, last_refreshed_time, link FROM StockMetadata ORDER BY name ASC',
    );
    return result.rows.map(row => this.rowToStock(row));
  }

  async refreshStock(id: number): Promise<StockMetadata | null> {
    const stockResult = await this.pool.query(
      'SELECT id, name, symbol, country, value, variation, last_update_time, last_refreshed_time, link FROM StockMetadata WHERE id = $1',
      [id],
    );
    if (stockResult.rows.length === 0) return null;
    const stock = this.rowToStock(stockResult.rows[0]);

    const quoteResult = await this.fetchQuote(stock.symbol);
    if (!quoteResult) return null;

    await this.pool.query(
      'UPDATE StockMetadata SET value=$1, variation=$2, last_update_time=$3, last_refreshed_time=NOW() WHERE id=$4',
      [quoteResult.value, quoteResult.variation, quoteResult.lastUpdateTime, id],
    );

    const updated = await this.pool.query(
      'SELECT id, name, symbol, country, value, variation, last_update_time, last_refreshed_time, link FROM StockMetadata WHERE id = $1',
      [id],
    );
    return this.rowToStock(updated.rows[0]);
  }

  // ── Auth session (crumb + cookies) ──────────────────────────────────────────

  private async getAuthSession(forceRefresh = false): Promise<AuthSession | null> {
    if (!forceRefresh && this.authSession && Date.now() < this.authSession.expiresAt) {
      return this.authSession;
    }
    try {
      // Step 1: hit finance.yahoo.com to establish session cookies
      const pageResponse = await axios.get('https://finance.yahoo.com/', {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      const rawCookies: string[] = (pageResponse.headers['set-cookie'] as string[]) || [];
      const cookies = rawCookies.map(c => c.split(';')[0]).join('; ');

      // Step 2: exchange cookies for a crumb
      const crumbResponse = await axios.get(
        'https://query2.finance.yahoo.com/v1/test/getcrumb',
        {
          headers: {
            'User-Agent': USER_AGENT,
            'Cookie': cookies,
          },
          timeout: 10000,
        },
      );
      const crumb = crumbResponse.data as string;
      if (!crumb || typeof crumb !== 'string') {
        console.error('Received empty crumb from Yahoo Finance');
        return null;
      }

      this.authSession = { crumb, cookies, expiresAt: Date.now() + 60 * 60 * 1000 };
      return this.authSession;
    } catch (error) {
      console.error('Error establishing Yahoo Finance auth session:', error);
      return null;
    }
  }

  // ── Quote fetch with automatic session retry on 401 ─────────────────────────

  private async fetchQuote(
    symbol: string,
    retry = true,
  ): Promise<{ value: number; variation: number; lastUpdateTime: Date } | null> {
    const auth = await this.getAuthSession();
    if (!auth) return null;

    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&crumb=${encodeURIComponent(auth.crumb)}`,
        {
          headers: {
            'User-Agent': USER_AGENT,
            'Cookie': auth.cookies,
          },
          timeout: 10000,
        },
      );
      const quote = response.data?.quoteResponse?.result?.[0];
      if (!quote) {
        console.error(`No quote data returned for symbol: ${symbol}`);
        return null;
      }
      return {
        value: quote.regularMarketPrice,
        variation: quote.regularMarketChangePercent,
        lastUpdateTime: new Date(quote.regularMarketTime * 1000),
      };
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status === 401 && retry) {
        // Session expired — force a new one and retry once
        console.log('Yahoo Finance session expired, refreshing and retrying...');
        this.authSession = null;
        return this.fetchQuote(symbol, false);
      }
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  private rowToStock(row: any): StockMetadata {
    return {
      id: row.id,
      name: row.name,
      symbol: row.symbol,
      country: row.country,
      value: row.value != null ? parseFloat(row.value) : undefined,
      variation: row.variation != null ? parseFloat(row.variation) : undefined,
      lastUpdateTime: row.last_update_time,
      lastRefreshedTime: row.last_refreshed_time,
      link: row.link,
    };
  }
}
