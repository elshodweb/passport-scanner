import { Test, TestingModule } from '@nestjs/testing';
import { PassportService } from './passport.service';
import { getModelToken } from '@nestjs/mongoose';
import { Passport } from '../../schemas/passport.schema';

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
      ],
    }).compile();

    service = module.get<PassportService>(PassportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
