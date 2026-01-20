import { Expose } from 'class-transformer';

export class MenuResponseDto {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  price: number;

  @Expose()
  image?: string;

  @Expose()
  available: boolean;

  @Expose()
  category: unknown;

  @Expose()
  user?: unknown;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
