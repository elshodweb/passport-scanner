import { Test, TestingModule } from '@nestjs/testing';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';
import { GetPassportsDto } from './dto/get-passports.dto';

describe('PassportController', () => {
  let controller: PassportController;
  let passportService: PassportService;

  const mockPassportService = {
    analizePassport: jest.fn(),
    getAllPassports: jest.fn(),
    updatePassport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassportController],
      providers: [
        {
          provide: PassportService,
          useValue: mockPassportService,
        },
      ],
    }).compile();

    controller = module.get<PassportController>(PassportController);
    passportService = module.get<PassportService>(PassportService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyzePassport', () => {
    it('should delegate to passportService.analizePassport', async () => {
      const files = [{ originalname: 'test.jpg' }] as any;
      mockPassportService.analizePassport.mockResolvedValue('analyzedResult');

      const result = await controller.analyzePassport(files);

      expect(passportService.analizePassport).toHaveBeenCalledWith(files);
      expect(result).toBe('analyzedResult');
    });
  });

  describe('getAllPassports', () => {
    it('should delegate to passportService.getAllPassports with query dto', async () => {
      const queryDto = new GetPassportsDto();
      queryDto.page = 2;
      queryDto.limit = 5;

      mockPassportService.getAllPassports.mockResolvedValue('paginatedPassports');

      const result = await controller.getAllPassports(queryDto);

      expect(passportService.getAllPassports).toHaveBeenCalledWith(queryDto);
      expect(result).toBe('paginatedPassports');
    });
  });

  describe('updatePassport', () => {
    it('should delegate to passportService.updatePassport to update a specific passport', async () => {
      const mockId = 'uuid-1234';
      const updateDto = { firstName: 'NewName' };

      mockPassportService.updatePassport.mockResolvedValue('updatedPassport');

      const result = await controller.updatePassport(mockId, updateDto);

      expect(passportService.updatePassport).toHaveBeenCalledWith(mockId, updateDto);
      expect(result).toBe('updatedPassport');
    });
  });
});
