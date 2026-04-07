import { Controller, HttpStatus, Query } from '@nestjs/common';
import { GetPassportsDto } from './dto/get-passports.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';
import { PassportService } from './passport.service';
import { Post, UploadedFiles, UseInterceptors, ParseFilePipeBuilder, Get, Patch, Param, Body } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('passport')
@Controller('passport')
export class PassportController {
  
  constructor(private readonly passportService: PassportService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze passport images and extract structured data' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload one or more passport images (JPEG/PNG) to extract their information. Max size: 5MB per file.',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async analyzePassport(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    files: Express.Multer.File[],
  ) {
    return this.passportService.analizePassport(files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all analyzed passports' })
  @ApiResponse({ status: 200, description: 'List of all passports' })
  async getAllPassports(@Query() query: GetPassportsDto) {
    return this.passportService.getAllPassports(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific passport by ID' })
  @ApiBody({ type: UpdatePassportDto, description: 'The fields you want to update (all optional)' })
  @ApiResponse({ status: 200, description: 'Passport updated successfully' })
  @ApiResponse({ status: 400, description: 'Passport not found or bad data' })
  async updatePassport(@Param('id') id: string, @Body() updateData: UpdatePassportDto) {
    return this.passportService.updatePassport(id, updateData);
  }
}
