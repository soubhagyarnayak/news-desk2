import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { Pool, PoolConfig } from 'pg';

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
    const config:PoolConfig = {
      user: this.get<string>('DB_USER'),
      password: this.get<string>('DB_PASSWORD'),
      host: this.get<string>('DB_HOST'),
      database: this.get<string>('DB_DATABASE'),
    };

    const port = this.get<number>('DB_PORT');
    if (port) {
      config.port = port;
    }

    const certificateFilePath = this.get<string>('DB_CERTIFICATE_PATH');
    if (certificateFilePath) {
      config.ssl = {
        ca: fs.readFileSync(certificateFilePath).toString(),
        rejectUnauthorized: true,
      }
    }

    return new Pool(config);
  }
}
