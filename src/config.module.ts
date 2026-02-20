import { ConfigService } from './config.service';

// Plain ConfigModule replacement — provides a configured ConfigService instance
export class ConfigModule {
  static getConfigService() {
    return new ConfigService('.env');
  }
}
