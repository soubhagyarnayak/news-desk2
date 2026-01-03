import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { Pool } from 'pg';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    if (fs.existsSync(filePath)) {
      this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }
  }

  get<T>(key: string): T {
    if (this.envConfig) {
      return this.envConfig[key] as T;
    }
    return process.env[key] as T;
  }

  getPool() {
    let pool = new Pool({
      user: this.get('DB_USER'),
      password: this.get('DB_PASSWORD'),
      host: this.get('DB_HOST'),
      database: this.get('DB_DATABASE'),
    });

    const port = this.get<number>('DB_PORT');
    if (port) {
      pool.options.port = port;
    }

    const certificateFilePath = this.get<string>('DB_CERTIFICATE_PATH');
    if (certificateFilePath) {
      pool.options.ssl = {
        ca: fs.readFileSync(certificateFilePath).toString(),
        rejectUnauthorized: true,
      }
    }

    return pool;
  }
}
