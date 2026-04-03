import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Module({ 
    providers: [{
        provide:"MINIO_CLIENT",
        inject:[ConfigService],
        useFactory:(configService:ConfigService)=>{
            return new Client({
                endPoint:configService.get<string>("MINIO_ENDPOINT")|| "localhost",
                port:configService.get<number>("MINIO_PORT")|| 9000,
                useSSL: false,
                accessKey:configService.get<string>("MINIO_ACCESS_KEY")|| "minioadmin",
                secretKey:configService.get<string>("MINIO_SECRET_KEY")|| "minioadmin",
            });
        }
    },MinioService],
    exports: ["MINIO_CLIENT",MinioService],
})
export class MinioModule {}
