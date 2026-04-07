import { Test, TestingModule } from '@nestjs/testing';
import { PassportService } from './passport.service';
import { getModelToken } from '@nestjs/mongoose';
import { Passport } from '../../schemas/passport.schema';
import { OpenaiService } from '../openai/openai.service';
import { MinioService } from '../minio/minio.service';

describe('PassportService', () => {
  let service: PassportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PassportService>(PassportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
