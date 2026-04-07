import { Module } from '@nestjs/common';
import { PassportService } from './passport.service';
import { PassportController } from './passport.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Passport, PassportSchema } from '../../schemas/passport.schema';
import { OpenaiModule } from '../openai/openai.module';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Passport.name, schema: PassportSchema },
    ]),
    OpenaiModule,
    MinioModule,
  ],
  controllers: [PassportController],
  providers: [PassportService],
  exports:[PassportService]
})
export class PassportModule {}
