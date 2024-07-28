import { Module } from '@nestjs/common';
import { ConfigModule } from '../config.module';
import { HnService } from './hn.service';
import { HnController } from './hn.controller';

@Module({
  imports: [ConfigModule],
  providers: [HnService],
  controllers: [HnController],
  exports: [HnService],
})
export class UsersModule {}
