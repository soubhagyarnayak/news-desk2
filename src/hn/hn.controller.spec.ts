import { Test, TestingModule } from '@nestjs/testing';
import { HnController } from './hn.controller';

describe('Hn Controller', () => {
  let controller: HnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnController],
    }).compile();

    controller = module.get<HnController>(HnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
