import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    if (fs.existsSync(filePath)) {
      this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }
  }

  get(key: string): string {
    if (this.envConfig) {
      return this.envConfig[key];
    }
    return process.env[key];
  }
}
