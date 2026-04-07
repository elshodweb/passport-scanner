import { Test, TestingModule } from '@nestjs/testing';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';
import { getModelToken } from '@nestjs/mongoose';
import { Passport } from '../../schemas/passport.schema';
import { OpenaiService } from '../openai/openai.service';
import { MinioService } from '../minio/minio.service';

describe('PassportController', () => {
  let controller: PassportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassportController],
      providers: [
        PassportService,
        {
          provide: getModelToken(Passport.name),
          useValue: {},
        },
        {
          provide: OpenaiService,
          useValue: {},
        },
        {
          provide: MinioService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PassportController>(PassportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
