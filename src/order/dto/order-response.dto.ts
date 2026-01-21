import { Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  _id: string;

  @Expose()
  user: unknown;

  @Expose()
  items: unknown[];

  @Expose()
  total: number;

  @Expose()
  status: string;

  @Expose()
  deliveryAddress?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
