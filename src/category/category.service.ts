import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import Category, { CategoryDocument } from './entities/category.entity';
import { Model, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Record<string, unknown>> {
    const created = new this.categoryModel(createCategoryDto as any);
    const saved = await created.save();
    return this.categoryModel
      .findById(saved._id)
      .lean()
      .exec() as unknown as Record<string, unknown>;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    return this.categoryModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const cat = await this.categoryModel.findById(id).lean().exec();
    if (!cat) {
      throw new NotFoundException('Category not found');
    }
    return cat as unknown as Record<string, unknown>;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const dto: UpdateQuery<CategoryDocument> =
      updateCategoryDto as unknown as UpdateQuery<CategoryDocument>;
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated as unknown as Record<string, unknown>;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const removed = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException('Category not found');
    }
    return;
  }
}
