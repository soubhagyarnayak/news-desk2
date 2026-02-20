import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config.module';
import { HnService } from './hn/hn.service';
import { SettingsService } from './settings/settings.service';
import { OpedService } from './oped/oped.service';
import { ConfigService } from './config.service';

// AppModule retained as a plain class for compatibility; dependency wiring
// is handled manually in Express entrypoint now.
export class AppModule {}
