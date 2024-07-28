import { Test, TestingModule } from '@nestjs/testing';
import { OpedController } from './oped.controller';
import { OpedService } from './oped.service';
import { ConfigService } from '../config.service';

describe('Oped Controller', () => {
  let controller: OpedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpedController],
      providers: [OpedService, ConfigService],
    }).compile();

    controller = module.get<OpedController>(OpedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
