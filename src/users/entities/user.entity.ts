import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export default class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: ['cus', 'adm'], default: 'cus' })
  role: string;

  @Prop()
  address?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
