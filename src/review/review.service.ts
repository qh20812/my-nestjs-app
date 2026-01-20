import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import Review, { ReviewDocument } from './entities/review.entity';
import { Model, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
  ): Promise<Record<string, unknown>> {
    if (
      !Types.ObjectId.isValid(createReviewDto.user) ||
      !Types.ObjectId.isValid(createReviewDto.item)
    ) {
      throw new BadRequestException('Invalid user or item id');
    }
    const created = new this.reviewModel(createReviewDto as any);
    const saved = await created.save();
    return this.reviewModel
      .findById(saved._id)
      .populate('user', 'name email')
      .populate('item', 'name price')
      .lean()
      .exec() as unknown as Record<string, unknown>;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    return this.reviewModel
      .find()
      .populate('user', 'name email')
      .populate('item', 'name price')
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const review = await this.reviewModel
      .findById(id)
      .populate('user', 'name email')
      .populate('item', 'name price')
      .lean()
      .exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review as unknown as Record<string, unknown>;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const dto: UpdateQuery<ReviewDocument> =
      updateReviewDto as unknown as UpdateQuery<ReviewDocument>;
    const dtoObj = dto as Record<string, unknown>;
    if (
      dtoObj.user &&
      typeof dtoObj.user === 'string' &&
      !Types.ObjectId.isValid(dtoObj.user)
    ) {
      throw new BadRequestException('Invalid user id');
    }
    if (
      dtoObj.item &&
      typeof dtoObj.item === 'string' &&
      !Types.ObjectId.isValid(dtoObj.item)
    ) {
      throw new BadRequestException('Invalid item id');
    }
    const updated = await this.reviewModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate('user', 'name email')
      .populate('item', 'name price')
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Review not found');
    }
    return updated as unknown as Record<string, unknown>;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const removed = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException('Review not found');
    }
    return;
  }
}
