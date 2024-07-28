import { Test, TestingModule } from '@nestjs/testing';
import { OpedService } from './oped.service';
import { ConfigService } from '../config.service';

describe('OpedService', () => {
  let service: OpedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpedService, ConfigService],
    }).compile();

    service = module.get<OpedService>(OpedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
