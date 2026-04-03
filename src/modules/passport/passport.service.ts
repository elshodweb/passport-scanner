import { Injectable } from '@nestjs/common';
import { Passport } from '../../schemas/passport.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PassportService {
    constructor(@InjectModel(Passport.name) private readonly passportModel: Model<Passport>) {}
}
