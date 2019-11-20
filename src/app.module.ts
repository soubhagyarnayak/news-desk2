import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config.module';
import { HnService } from './hn/hn.service'
import { HnController } from './hn/hn.controller';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { OpedController } from './oped/oped.controller';
import { OpedService } from './oped/oped.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule, AuthModule, UsersModule],
  controllers: [AppController, HnController, SettingsController, OpedController],
  providers: [AppService, HnService, SettingsService, OpedService],
})
export class AppModule {}
