import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export default class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop([
    {
      menu: { type: Types.ObjectId, ref: 'Menu' },
      quantity: { type: Number, required: true },
    },
  ])
  items: { menu: Types.ObjectId; quantity: number }[];

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'pending' })
  status: string; // e.g., 'pending', 'confirmed', 'delivered', 'cancelled'

  @Prop()
  deliveryAddress?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
