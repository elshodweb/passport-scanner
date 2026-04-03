import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Module({
    providers: [{
        provide: "OPENAI_CLIENT",
        inject:[ConfigService],
        useFactory:(config: ConfigService)=> {
            return new OpenAI({
                apiKey: config.get<string>("OPENAI_API_KEY")
            })
        },
    },OpenaiService],
    exports: [OpenaiService],
})
export class OpenaiModule {}
