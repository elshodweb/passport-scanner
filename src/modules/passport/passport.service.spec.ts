import { Test, TestingModule } from '@nestjs/testing';
import { PassportService } from './passport.service';
import { getModelToken } from '@nestjs/mongoose';
import { Passport } from '../../schemas/passport.schema';
import { OpenaiService } from '../openai/openai.service';
import { MinioService } from '../minio/minio.service';
import { BadRequestException } from '@nestjs/common';

const mockFindExec = jest.fn();
const mockCountExec = jest.fn();
const mockUpdateExec = jest.fn();

class MockPassportModel {
  public data: any;
  public save: jest.Mock;
  constructor(data: any) {
    this.data = data;
    this.save = jest.fn().mockResolvedValue({
      ...this.data,
      toObject: () => this.data,
    });
  }

  static find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: mockFindExec,
        }),
      }),
    }),
  });

  static countDocuments = jest.fn().mockReturnValue({
    exec: mockCountExec,
  });

  static findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: mockUpdateExec,
  });
}

describe('PassportService', () => {
  let service: PassportService;
  let openaiService: OpenaiService;
  let minioService: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportService,
        {
          provide: getModelToken(Passport.name),
          useValue: MockPassportModel,
        },
        {
          provide: OpenaiService,
          useValue: {
            extractPassportData: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PassportService>(PassportService);
    openaiService = module.get<OpenaiService>(OpenaiService);
    minioService = module.get<MinioService>(MinioService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analizePassport', () => {
    it('should throw if incorrect number of files', async () => {
      await expect(service.analizePassport([])).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.analizePassport([{} as any, {} as any, {} as any]),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if openai says isPassport is false', async () => {
      jest.spyOn(openaiService, 'extractPassportData').mockResolvedValue({
        isPassport: false,
      } as any);

      const files = [{ buffer: Buffer.from('test') }] as any;
      await expect(service.analizePassport(files)).rejects.toThrow(
        'This is not a passport image',
      );
    });

    it('should process and save passport successfully', async () => {
      const mockAnalizedData = {
        isPassport: true,
        firstName: 'John',
        lastName: 'Doe',
        gender: 'M',
        dateOfBirth: '1990-01-01',
        precision: 95,
      };

      jest
        .spyOn(openaiService, 'extractPassportData')
        .mockResolvedValue(mockAnalizedData as any);
      jest.spyOn(minioService, 'uploadFile').mockResolvedValue({
        storageName: 'test-image.jpg',
      } as any);
      jest
        .spyOn(minioService, 'getFileUrl')
        .mockResolvedValue('http://signed-url.com/test-image.jpg');

      const files = [{ buffer: Buffer.from('test') }] as any;
      const result = await service.analizePassport(files);

      expect(result.firstName).toBe('John');
      expect(result.gender).toBe('ERKAK');
      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.imageUrls).toEqual([
        'http://signed-url.com/test-image.jpg',
      ]);
    });
  });

  describe('getAllPassports', () => {
    it('should handle search query, pagination, and map image URLs', async () => {
      const mockPassports = [
        {
          toObject: () => ({
            _id: '1',
            firstName: 'John',
            imageUrls: ['img1.jpg'],
          }),
        },
      ];

      mockFindExec.mockResolvedValue(mockPassports);
      mockCountExec.mockResolvedValue(1);
      jest
        .spyOn(minioService, 'getFileUrl')
        .mockResolvedValue('http://signed-url.com/img1.jpg');

      const query = { page: 1, limit: 10, search: 'John', minPrecision: 80 };
      const result = await service.getAllPassports(query);

      expect(MockPassportModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          precision: { $gte: 80 },
        }),
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].imageUrls).toEqual([
        'http://signed-url.com/img1.jpg',
      ]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('updatePassport', () => {
    it('should throw error if passport not found', async () => {
      mockUpdateExec.mockResolvedValue(null);

      await expect(service.updatePassport('invalid-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully update and return signed URLs', async () => {
      mockUpdateExec.mockResolvedValue({
        toObject: () => ({
          _id: '1',
          firstName: 'Updated',
          imageUrls: ['img2.jpg'],
        }),
      });
      jest
        .spyOn(minioService, 'getFileUrl')
        .mockResolvedValue('http://signed-url.com/img2.jpg');

      const result = await service.updatePassport('1', { firstName: 'Updated' });

      expect(result.firstName).toBe('Updated');
      expect(result.imageUrls).toEqual([
        'http://signed-url.com/img2.jpg',
      ]);
    });
  });
});
