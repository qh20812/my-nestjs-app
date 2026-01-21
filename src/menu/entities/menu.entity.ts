import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true, collection: 'menus' })
export default class Menu {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image?: string; // URL or path to image

  @Prop({ default: true })
  available: boolean; // Is the menu item available
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
