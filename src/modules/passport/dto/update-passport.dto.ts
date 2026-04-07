import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsDate, IsArray } from 'class-validator';

export class UpdatePassportDto {
  @ApiPropertyOptional({ description: 'First name of the passport holder', example: 'Elshodjon' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name of the passport holder', example: 'Tukhtamurodov' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Middle name or patronymic', example: "Sultonmurod O'g'li" })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ description: 'Gender of the passport holder', example: 'M' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '2003-06-26T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Place of birth', example: 'Yunusobod Tumani' })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @ApiPropertyOptional({
    description:
      'Place of issue (ID card: "Berilgan joyi / Place of issue", passport: "KIM TOMONIDAN BERILGAN")',
    example: 'IIV 60010',
  })
  @IsOptional()
  @IsString()
  placeOfIssue?: string;

  @ApiPropertyOptional({ description: 'Passport number', example: 'AC123456' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({
    description: 'Personal number (e.g. 50345678901234)',
    example: '52606035970016',
  })
  @IsOptional()
  @IsString()
  personalNumber?: string;

  @ApiPropertyOptional({ description: 'Passport expiration date', example: '2029-06-27T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  passportExpirationDate?: Date;

  @ApiPropertyOptional({ description: 'Passport issuing date', example: '2019-06-26T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  passportIssuingDate?: Date;

  @ApiPropertyOptional({ description: 'Nationality', example: 'UZB' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Confidence precision score (0-100)', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precision?: number;

  @ApiPropertyOptional({
    description: 'Stored document image object names in storage',
    example: ['1775549340986-passport-front.jpg', '1775549340987-passport-back.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
