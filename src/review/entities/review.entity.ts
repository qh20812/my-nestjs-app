import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'reviews' })
export default class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true })
  item: Types.ObjectId;
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;
  @Prop()
  title: string;
  @Prop()
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
