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
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule, 
    AuthModule, 
    UsersModule, 
    JwtModule.registerAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`
          }
        }),
        inject: [ConfigService],
      })],
  controllers: [AppController, HnController, SettingsController, OpedController, AuthController],
  providers: [AppService, ConfigService, HnService, SettingsService, OpedService, AuthService],
})
export class AppModule {}
