// src/modules/openai/openai.service.ts
import { Injectable, Inject } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  constructor(@Inject('OPENAI_CLIENT') private readonly openai: OpenAI) {}

  async extractPassportData(imageBase64: string) {
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
            { type: 'text', text: 'Analyze this passport and extract the info.' },
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
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              passportNumber: { type: 'string' },
              nationality: { type: 'string' },
              precision: { type: 'string', description: 'Confidence score from 0-100%' },
            },
            required: ['firstName', 'lastName', 'passportNumber', 'nationality', 'precision'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response content');
    }

    return JSON.parse(content);
  }
}