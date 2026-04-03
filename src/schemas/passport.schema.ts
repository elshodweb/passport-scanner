import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PassportDocument = Passport & Document;

@Schema({ timestamps: true })
export class Passport {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  middleName: string;
  
  @Prop({ required: true })
  gender: string;
  
  @Prop({ required: true })
  dateOfBirth: Date;
  
  @Prop({ required: true })
  placeOfBirth: string;
  
  @Prop({ required: true })
  passportNumber: string;
  
  @Prop({ required: true })
  passportExpirationDate: Date;
  
  @Prop({ required: true })
  passportIssuingDate: Date;
}

export const PassportSchema = SchemaFactory.createForClass(Passport);