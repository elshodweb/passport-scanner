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
  constructor(
    @InjectModel(Passport.name) private readonly passportModel: Model<Passport>,
    @Inject() private readonly openAI: OpenaiService,
    @Inject() private readonly minio: MinioService,
  ) {}

  async analizePassport(files: Express.Multer.File[]) {
    this.logger.log(`Analizing ${files.length} passports...`);
    const analizedDataArray: Passport[] = [];
    for (const file of files) {
      const analizedData = await this.openAI.extractPassportData(
        file.buffer.toString('base64'),
      );
      if (!analizedData.isPassport) {
        this.logger.debug('analizedData::', analizedData);
        this.logger.error('This is not a passport image');
        throw new BadRequestException('This is not a passport image');
      }
      const uploadedFile = await this.minio.uploadFile(file);
      console.log(
        'uploadedFile::',
        await this.minio.getFileUrl(uploadedFile.storageName),
      );

      const passport = new this.passportModel({
        firstName: analizedData.firstName,
        lastName: analizedData.lastName,
        middleName: analizedData.middleName,
        gender: analizedData.gender,
        dateOfBirth: analizedData.dateOfBirth,
        placeOfBirth: analizedData.placeOfBirth,
        passportNumber: analizedData.passportNumber,
        passportIssuingDate: analizedData.passportIssuingDate,
        passportExpirationDate: analizedData.passportExpirationDate,
        nationality: analizedData.nationality,
        precision: analizedData.precision,
        url: uploadedFile.storageName,
      });
      const savedPassport = await passport.save();
      analizedDataArray.push({
        ...savedPassport.toObject() ,
        url: uploadedFile.storageName   ? await this.minio.getFileUrl(uploadedFile.storageName) : '',
      });
    }
    this.logger.log(`Analized ${analizedDataArray.length} passports...`);
    return analizedDataArray;
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
        const obj = p.toObject();
        if (obj.url) {
          obj.url = await this.minio.getFileUrl(obj.url as string);
        }
        return obj;
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
    
    const obj = updated.toObject();
    if (obj.url) {
      obj.url = await this.minio.getFileUrl(obj.url as string);
    }
    return obj;
  }
}
