import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config.module';
import { HnService } from './hn/hn.service'
import { HnController } from './hn/hn.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AppController, HnController],
  providers: [AppService, HnService],
})
export class AppModule {}
