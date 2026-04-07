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
              'Extract passport/ID details into a structured JSON format. If any information is not clear, missing, or unreadable, do not guess or write random things; just set the field to null.  Name priority rule: if multiple name spellings exist (national-script transliteration line vs MRZ transliteration), prefer the primary visual name line in the document data section and use MRZ only as fallback. ',
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
                    'Set isPassport=true whenever the image(s) contain a real passport/ID document with readable document fields, even if the photo is taken on a white A4 sheet, printed copy, scan, or handheld phone camera shot with perspective/noise. Set isPassport=false only when there is no passport/ID document content to extract. If the document is not a passport or ID, set isPassport=false.',
                },
                firstName: {
                  type: ['string', 'null'],
                  description:
                    'First name of the holder from the primary data line. If there is a conflict with MRZ/transliteration variants, keep the primary visual data-line version and do not overwrite it with MRZ.',
                },
                lastName: {
                  type: ['string', 'null'],
                  description:
                    "Last name of the holder from the primary data line. If multiple variants exist (e.g. To'XTAMURODOV vs TUKHTAMURODOV), choose the primary visual data-line version and use MRZ only as fallback.",
                },
                middleName: {
                  type: ['string', 'null'],
                  description:
                    'Middle name or Patronymic (Father\'s name, e.g., "OTASINING ISMI"). Extract if present in any language section. Return null if truly none.',
                },
                gender: {
                  type: ['string', 'null'],
                  description: 'Gender of the passport holder. MUST be exactly "M" or "F". Translate local terms (e.g. "AYOL" -> "F", "ERKAK" -> "M").',
                },
                dateOfBirth: {
                  type: ['string', 'null'],
                  description:
                    'Date of birth of the passport holder (YYYY-MM-DD)',
                },
                placeOfBirth: {
                  type: ['string', 'null'],
                  description: 'Place of birth of the passport holder',
                },
                placeOfIssue: {
                  type: ['string', 'null'],
                  description:
                    'Place of issue. For ID card extract from label "Berilgan joyi / Place of issue" (often on back side). For passport extract issuing authority/place from "KIM TOMONIDAN BERILGAN". and most cases you can see IIV => ichki ishlar vazirligi',
                },
                passportNumber: {
                  type: ['string', 'null'],
                  description: 'Passport number',
                },
                personalNumber: {
                  type: ['string', 'null'],
                  description:
                    'Personal Number (PINFL). MUST be exactly 14 digits. CRITICAL WARNING: DO NOT calculate or invent this number. You must exact-copy it from the text. Rules: (1) Passports: Look at the very bottom MRZ line (Line 2). Find the 6-digit Expiration Date (e.g., 271010) and its 1-digit check number (e.g., 9). The PINFL is the EXACT sequence of 14 digits immediately following that. It is exactly the 14 digits located just before the final 2 digits of the line. Example: If the MRZ ends with "...F27101096230901640002140", the 14-digit PINFL is "62309016400021". (2) ID cards: Extract the 14-digit number explicitly printed next to "Shaxsiy raqam / Personal number". If absent, extract from the ID MRZ where the 14 digits appear right before the final "<" symbol.',
                },
                passportIssuingDate: {
                  type: ['string', 'null'],
                  description: 'Date of issue of the passport (YYYY-MM-DD)',
                },
                passportExpirationDate: {
                  type: ['string', 'null'],
                  description: 'Expiration date of the passport (YYYY-MM-DD)',
                },
                nationality: {
                  type: ['string', 'null'],
                  description: 'Ethnic nationality of the passport holder (e.g., "UZBEK", "RUSSIAN", "TAJIK", "KAZAKH", etc.). Extract this from the "MILLATI" field. CRITICAL: DO NOT return the country name (like "UZBEKISTAN", "O\'ZBEKISTON", etc.). Translate the local ethnic term to English (e.g., "O\'ZBEK" -> "UZBEK", "RUS" -> "RUSSIAN", etc.).',
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
