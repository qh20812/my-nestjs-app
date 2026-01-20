import { Expose } from 'class-transformer';

export class ReviewResponseDto {
  @Expose()
  _id: string;

  @Expose()
  user: unknown;

  @Expose()
  item: unknown;

  @Expose()
  rating: number;

  @Expose()
  title?: string;

  @Expose()
  comment?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
