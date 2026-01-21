import { Expose } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
