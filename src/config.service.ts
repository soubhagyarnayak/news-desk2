import * as dotenv from 'dotenv';
import * as fs from 'fs';

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
}
