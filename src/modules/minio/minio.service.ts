import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'minio';

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'passports';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  constructor(@Inject('MINIO_CLIENT') private readonly minioClient: Client) {}

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await this.minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      this.logger.log(`Uploading ${file.originalname}...`);
      const fileName = `${Date.now()}-${file.originalname}`;

      // 1. Загружаем объект в MinIO
      await this.minioClient.putObject(
        BUCKET_NAME,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      // 2. Генерируем временную ссылку (например, на 24 часа = 86400 секунд)
      const expiry = 24 * 60 * 60;
      this.logger.log(`Generated presigned URL for file: ${fileName}`);

      const presignedUrl = await this.minioClient.presignedGetObject(
        BUCKET_NAME,
        fileName,
        expiry,
      );

      return {
        originalName: file.originalname,
        storageName: fileName,
        url: presignedUrl,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error}`);
      throw new InternalServerErrorException('Error uploading file');
    }
  }

  // Дополнительный метод: если вам нужно получить новую ссылку позже
  async getFileUrl(fileName: string) {
    const expiry = 24 * 60 * 60;
    return await this.minioClient.presignedGetObject(
      BUCKET_NAME,
      fileName,
      expiry,
      {
        'response-content-type': 'image/jpeg',
        'response-content-disposition': `inline; filename="${fileName}"`,
      },
    );
  }
}
