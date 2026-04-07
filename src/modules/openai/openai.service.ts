// src/modules/openai/openai.service.ts
import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  constructor(@Inject('OPENAI_CLIENT') private readonly openai: OpenAI) {}

  async extractPassportData(imageBase64: string) {
    try {
      this.logger.log(`Extracting passport data from image...`);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // or 'gpt-4o' for higher accuracy
        messages: [
          {
            role: 'system',
            content: 'Extract passport details into a structured JSON format.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this passport and extract the info.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        // This ensures the output is ALWAYS valid JSON
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'passport_extraction',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                isPassport: {
                  type: 'boolean',
                  description: 'Is this a passport image?',
                },
                firstName: {
                  type: 'string',
                  description: 'First name of the passport holder',
                },
                lastName: {
                  type: 'string',
                  description: 'Last name of the passport holder',
                },
                middleName: {
                  type: 'string',
                  description: 'Middle name or Patronymic (Father\'s name, e.g., "OTASINING ISMI"). Extract if present in any language section. Leave empty if truly none.',
                },
                gender: {
                  type: 'string',
                  description: 'Gender of the passport holder (e.g. M, F)',
                },
                dateOfBirth: {
                  type: 'string',
                  description: 'Date of birth of the passport holder (YYYY-MM-DD)',
                },
                placeOfBirth: {
                  type: 'string',
                  description: 'Place of birth of the passport holder',
                },
                passportNumber: {
                  type: 'string',
                  description: 'Passport number',
                },
                passportIssuingDate: {
                  type: 'string',
                  description: 'Date of issue of the passport (YYYY-MM-DD)',
                },
                passportExpirationDate: {
                  type: 'string',
                  description: 'Expiration date of the passport (YYYY-MM-DD)',
                },
                nationality: {
                  type: 'string',
                  description: 'Nationality of the passport holder',
                },
                precision: {
                  type: 'number',
                  description: 'Confidence score from 0-100%',
                },
              },
              required: [
                'isPassport', 
                'firstName',
                'lastName',
                'middleName',
                'gender',
                'dateOfBirth',
                'placeOfBirth',
                'passportNumber',
                'passportIssuingDate',
                'passportExpirationDate',
                'nationality',
                'precision',
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty response content');
      }
      this.logger.log(`Passport data extracted successfully`);
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Error extracting passport data: ${error}`);
      throw new InternalServerErrorException('Error extracting passport data');
    }
  }
}
