import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';

describe('MinioService', () => {
  let service: MinioService;
  let minioClientMock: {
    bucketExists: jest.Mock;
    makeBucket: jest.Mock;
    putObject: jest.Mock;
    presignedGetObject: jest.Mock;
  };

  beforeEach(async () => {
    minioClientMock = {
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
      putObject: jest.fn(),
      presignedGetObject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: 'MINIO_CLIENT',
          useValue: minioClientMock,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create bucket on module init if missing', async () => {
    minioClientMock.bucketExists.mockResolvedValue(false);

    await service.onModuleInit();

    expect(minioClientMock.bucketExists).toHaveBeenCalledTimes(1);
    expect(minioClientMock.makeBucket).toHaveBeenCalledTimes(1);
  });

  it('should upload files and return urls', async () => {
    minioClientMock.putObject.mockResolvedValue(undefined);
    minioClientMock.presignedGetObject.mockResolvedValue('http://example-url');
    const file = {
      originalname: 'passport.jpg',
      buffer: Buffer.from('x'),
      size: 1,
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const result = await service.uploadFile(file);

    expect(minioClientMock.putObject).toHaveBeenCalledTimes(1);
    expect(minioClientMock.presignedGetObject).toHaveBeenCalledTimes(1);
    expect(result.originalName).toBe('passport.jpg');
    expect(result.url).toBe('http://example-url');
  });

  it('should return a presigned url for getFileUrl', async () => {
    minioClientMock.presignedGetObject.mockResolvedValue('http://example-url');

    const url = await service.getFileUrl('stored-file.jpg');

    expect(minioClientMock.presignedGetObject).toHaveBeenCalledTimes(1);
    expect(url).toBe('http://example-url');
  });
});
