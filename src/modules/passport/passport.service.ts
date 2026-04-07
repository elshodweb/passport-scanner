import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Passport } from '../../schemas/passport.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OpenaiService } from '../openai/openai.service';
import { MinioService } from '../minio/minio.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class PassportService {
  private readonly logger = new Logger(PassportService.name);
  private static readonly UNKNOWN_VALUE = "aniq malumot yo'q";
  constructor(
    @InjectModel(Passport.name) private readonly passportModel: Model<Passport>,
    @Inject() private readonly openAI: OpenaiService,
    @Inject() private readonly minio: MinioService,
  ) {}

  async analizePassport(files: Express.Multer.File[]) {
    if (files.length < 1 || files.length > 2) {
      throw new BadRequestException(
        'Please upload from 1 to 2 images for one document',
      );
    }

    this.logger.log(`Analyzing 1 document from ${files.length} image(s)...`);

    const analizedData = await this.openAI.extractPassportData(
      files.map((file) => file.buffer.toString('base64')),
    );

    if (!analizedData.isPassport) {
      this.logger.debug('analizedData::', analizedData);
      this.logger.error('This is not a passport image');
      throw new BadRequestException('This is not a passport image');
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => this.minio.uploadFile(file)),
    );
    const dateOfBirth = this.parseDateOrNull(analizedData.dateOfBirth);
    const passportIssuingDate = this.parseDateOrNull(analizedData.passportIssuingDate);
    const passportExpirationDate = this.parseDateOrNull(analizedData.passportExpirationDate);
    const gender = this.normalizeGender(analizedData.gender);

    const passport = new this.passportModel({
      firstName: this.textOrUnknown(analizedData.firstName),
      lastName: this.textOrUnknown(analizedData.lastName),
      middleName: this.textOrUnknown(analizedData.middleName),
      gender,
      dateOfBirth,
      placeOfBirth: this.textOrUnknown(analizedData.placeOfBirth),
      placeOfIssue: this.textOrUnknown(analizedData.placeOfIssue),
      passportNumber: this.textOrUnknown(analizedData.passportNumber),
      personalNumber: this.textOrUnknown(analizedData.personalNumber),
      passportIssuingDate,
      passportExpirationDate,
      nationality: this.textOrUnknown(analizedData.nationality),
      precision: analizedData.precision,
      imageUrls: uploadedFiles.map((file) => file.storageName),
    });

    const savedPassport = await passport.save();
    this.logger.log(`Analyzed 1 document from ${files.length} image(s)...`);
    return this.toResponseWithSignedImageUrls(savedPassport.toObject());
  }

  async getAllPassports(query: any = {}) {
    this.logger.log('Fetching all passports with filters');
    
    // Safely cast string queries to numbers/dates in case generic ValidationPipe is not transforming
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter: any = {};

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { middleName: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.minPrecision !== undefined || query.maxPrecision !== undefined) {
      filter.precision = {};
      if (query.minPrecision !== undefined) filter.precision.$gte = Number(query.minPrecision);
      if (query.maxPrecision !== undefined) filter.precision.$lte = Number(query.maxPrecision);
    }

    if (query.passportNumber) {
      filter.passportNumber = { $regex: query.passportNumber, $options: 'i' };
    }

    const [passports, total] = await Promise.all([
      this.passportModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.passportModel.countDocuments(filter).exec()
    ]);

    const data = await Promise.all(
      passports.map(async (p) => {
        return this.toResponseWithSignedImageUrls(p.toObject());
      })
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async updatePassport(id: string, updateData: Partial<Passport>) {
    this.logger.log(`Updating passport ${id}`);
    const updated = await this.passportModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updated) {
      throw new BadRequestException('Passport not found');
    }

    return this.toResponseWithSignedImageUrls(updated.toObject());
  }

  private async toResponseWithSignedImageUrls(obj: any) {
    const storageNames: string[] = Array.isArray(obj.imageUrls)
      ? obj.imageUrls
      : obj.url
        ? [obj.url]
        : [];

    const imageUrls = await Promise.all(
      storageNames.map((name) => this.minio.getFileUrl(name)),
    );

    const { url, ...rest } = obj;
    return {
      ...rest,
      imageUrls,
    };
  }

  private parseDateOrNull(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsedDate = new Date(String(value));
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private textOrUnknown(value: unknown): string {
    const text = String(value ?? '').trim();
    return text.length > 0 ? text : PassportService.UNKNOWN_VALUE;
  }

  private normalizeGender(value: unknown): string {
    const normalized = String(value ?? '')
      .trim()
      .toUpperCase();

    if (normalized === 'F' || normalized === 'FEMALE' || normalized === 'AYOL') {
      return 'AYOL';
    }
    if (normalized === 'M' || normalized === 'MALE' || normalized === 'ERKAK') {
      return 'ERKAK';
    }

    return this.textOrUnknown(value);
  }
}
