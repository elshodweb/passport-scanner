import { Module } from '@nestjs/common';
import { PassportModule } from './modules/passport/passport.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { MinioModule } from './modules/minio/minio.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PassportModule,
    OpenaiModule,
    MinioModule,
    DatabaseModule,
  ],
  providers: [],
})
export class AppModule {}
