import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiService } from './openai.service';

describe('OpenaiService', () => {
  let service: OpenaiService;
  let createMock: jest.Mock;

  beforeEach(async () => {
    createMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenaiService,
        {
          provide: 'OPENAI_CLIENT',
          useValue: {
            chat: {
              completions: {
                create: createMock,
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<OpenaiService>(OpenaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse and return passport data', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              isPassport: true,
              firstName: 'Jane',
              lastName: 'Doe',
              passportNumber: 'A12345678',
              nationality: 'US',
              precision: 98,
            }),
          },
        },
      ],
    });

    await expect(service.extractPassportData(['base64-image'])).resolves.toEqual({
      isPassport: true,
      firstName: 'Jane',
      lastName: 'Doe',
      passportNumber: 'A12345678',
      nationality: 'US',
      precision: 98,
    });
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('should throw when OpenAI returns empty content', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    });

    await expect(service.extractPassportData(['base64-image'])).rejects.toThrow(
      'Error extracting passport data',
    );
  });
});
