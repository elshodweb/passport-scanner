import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min, IsDate } from 'class-validator';

export class GetPassportsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by scan date from (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Filter by scan date to (ISO 8601)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Search across first, last, and middle names' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum precision score (e.g. 0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrecision?: number;

  @ApiPropertyOptional({ description: 'Maximum precision score (e.g. 0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrecision?: number;

  @ApiPropertyOptional({ description: 'Exact or partial passport number' })
  @IsOptional()
  @IsString()
  passportNumber?: string;
}
