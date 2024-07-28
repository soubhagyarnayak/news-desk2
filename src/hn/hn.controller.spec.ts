import { Test, TestingModule } from '@nestjs/testing';
import { HnController } from './hn.controller';
import { HnService } from './hn.service';
import { ConfigService } from '../config.service';

describe('Hn Controller', () => {
  let controller: HnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnController],
      providers: [HnService, ConfigService],
    }).compile();

    controller = module.get<HnController>(HnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
