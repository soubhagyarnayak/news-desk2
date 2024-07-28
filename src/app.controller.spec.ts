import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getIndex', () => {
    it('should render the index page', () => {
      const req = {};
      const res = {
        render: jest.fn(),
      }
      const err = null;
      
      appController.getIndex(req, res, err);

      expect(res.render).toHaveBeenCalledWith('index');
    });
  });
});
