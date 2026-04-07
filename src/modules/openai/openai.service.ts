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

  async extractPassportData(imageBase64List: string[]) {
    try {
      this.logger.log(
        `Extracting passport data from ${imageBase64List.length} image(s)...`,
      );
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Extract passport/ID details into a structured JSON format. Set isPassport=true whenever the image(s) contain a real passport/ID document with readable document fields, even if the photo is taken on a white A4 sheet, printed copy, scan, or handheld phone camera shot with perspective/noise. Set isPassport=false only when there is no passport/ID document content to extract. Name priority rule: if multiple name spellings exist (national-script transliteration line vs MRZ transliteration), prefer the primary visual name line in the document data section and use MRZ only as fallback. Extract personalNumber with these rules: (1) Passport MRZ line 2: take 14 chars from the end, skipping the last 2 chars. Example AC20231255UZB0306263M29062765260603597001644 -> 52606035970016. (2) ID card: prefer explicit "Shaxsiy raqam / Personal number" value from the back side; if absent, extract from MRZ-like line pattern such as IUUZBAE1809479640312930250063< -> 40312930250063.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze these document image(s) that belong to a single document and extract the info.',
              },
              ...imageBase64List.map((imageBase64) => ({
                type: 'image_url' as const,
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              })),
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
                  description:
                    'True if the uploaded image(s) contain a passport or ID document and document fields are present/readable, regardless of capture style (scan, A4 sheet, phone photo, perspective/lighting/noise). False only when document content is absent.',
                },
                firstName: {
                  type: 'string',
                  description:
                    'First name of the holder from the primary data line. If there is a conflict with MRZ/transliteration variants, keep the primary visual data-line version and do not overwrite it with MRZ.',
                },
                lastName: {
                  type: 'string',
                  description:
                    "Last name of the holder from the primary data line. If multiple variants exist (e.g. To'XTAMURODOV vs TUKHTAMURODOV), choose the primary visual data-line version and use MRZ only as fallback.",
                },
                middleName: {
                  type: 'string',
                  description:
                    'Middle name or Patronymic (Father\'s name, e.g., "OTASINING ISMI"). Extract if present in any language section. Return empty string if truly none.',
                },
                gender: {
                  type: 'string',
                  description: 'Gender of the passport holder (e.g. M, F)',
                },
                dateOfBirth: {
                  type: 'string',
                  description:
                    'Date of birth of the passport holder (YYYY-MM-DD)',
                },
                placeOfBirth: {
                  type: 'string',
                  description: 'Place of birth of the passport holder',
                },
                placeOfIssue: {
                  type: 'string',
                  description:
                    'Place of issue. For ID card extract from label "Berilgan joyi / Place of issue" (often on back side). For passport extract issuing authority/place from "KIM TOMONIDAN BERILGAN".',
                },
                passportNumber: {
                  type: 'string',
                  description: 'Passport number',
                },
                personalNumber: {
                  type: 'string',
                  description:
                    'Personal number (14 digits for UZ passport/ID). For passport derive from MRZ line 2 by taking 14 chars from the end excluding final 2 check chars; for ID card use labeled "Shaxsiy raqam / Personal number" value or fallback to MRZ-like line extraction.',
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
                'placeOfIssue',
                'passportNumber',
                'personalNumber',
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
