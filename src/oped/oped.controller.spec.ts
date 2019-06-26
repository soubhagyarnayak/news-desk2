import { Test, TestingModule } from '@nestjs/testing';
import { OpedController } from './oped.controller';

describe('Oped Controller', () => {
  let controller: OpedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpedController],
    }).compile();

    controller = module.get<OpedController>(OpedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
