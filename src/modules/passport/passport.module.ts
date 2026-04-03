import { Module } from '@nestjs/common';
import { PassportService } from './passport.service';
import { PassportController } from './passport.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Passport, PassportSchema } from '../../schemas/passport.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Passport.name, schema: PassportSchema },
    ]),
  ],
  controllers: [PassportController],
  providers: [PassportService],
})
export class PassportModule {}
