import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectModel } from '@nestjs/mongoose';
import Menu, { MenuDocument } from './entities/menu.entity';
import { Model, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  async create(createMenuDto: CreateMenuDto): Promise<Record<string, unknown>> {
    const created = new this.menuModel(createMenuDto as any);
    const saved = await created.save();
    return this.menuModel
      .findById(saved._id)
      .populate('category')
      .populate('user', 'name email')
      .lean()
      .exec() as unknown as Record<string, unknown>;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    return this.menuModel
      .find()
      .populate('category')
      .populate('user', 'name email')
      .lean()
      .exec() as unknown as Record<string, unknown>[];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const menu = await this.menuModel
      .findById(id)
      .populate('category')
      .populate('user', 'name email')
      .lean()
      .exec();
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu as unknown as Record<string, unknown>;
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const dto: UpdateQuery<MenuDocument> =
      updateMenuDto as unknown as UpdateQuery<MenuDocument>;
    const updated = await this.menuModel
      .findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      })
      .populate('category')
      .populate('user', 'name email')
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Menu not found');
    }
    return updated as unknown as Record<string, unknown>;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const removed = await this.menuModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException('Menu not found');
    }
    return;
  }
}
