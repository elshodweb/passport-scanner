import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PassportDocument = Passport & Document;

@Schema({ timestamps: true })
export class Passport {
  @Prop({ required: false, default: null })
  firstName: string;

  @Prop({ required: false, default: null })
  lastName: string;

  @Prop({ required: false, default: null })
  middleName: string;

  @Prop({ required: false, default: null })
  gender: string;

  @Prop({ type: Date, required: false, default: null })
  dateOfBirth: Date;

  @Prop({ required: false, default: null })
  placeOfBirth: string;

  @Prop({ required: false, default: null })
  placeOfIssue: string;

  @Prop({ required: false, default: null })
  passportNumber: string;

  @Prop({ required: false, default: null })
  personalNumber: string;

  @Prop({ type: Date, required: false, default: null })
  passportExpirationDate: Date;

  @Prop({ type: Date, required: false, default: null })
  passportIssuingDate: Date;

  @Prop({ type: [String], required: true, default: [] })
  imageUrls: string[];

  @Prop({ required: false, default: null })
  nationality: string;

  @Prop({ required: true })
  precision: number;

}

export const PassportSchema = SchemaFactory.createForClass(Passport);
