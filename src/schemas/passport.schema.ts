import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PassportDocument = Passport & Document;

@Schema({ timestamps: true })
export class Passport {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false })
  middleName: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ type: Date, required: false, default: null })
  dateOfBirth: Date;

  @Prop({ required: true })
  placeOfBirth: string;

  @Prop({ required: true})
  placeOfIssue: string;

  @Prop({ required: true })
  passportNumber: string;

  @Prop({ required: true })
  personalNumber: string;

  @Prop({ type: Date, required: false, default: null })
  passportExpirationDate: Date;

  @Prop({ type: Date, required: false, default: null })
  passportIssuingDate: Date;

  @Prop({ type: [String], required: true, default: [] })
  imageUrls: string[];

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  precision: number;

}

export const PassportSchema = SchemaFactory.createForClass(Passport);
