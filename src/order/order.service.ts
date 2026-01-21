import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import Order, { OrderDocument } from './entities/order.entity';
import Menu, { MenuDocument } from '../menu/entities/menu.entity';
import { Model, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
  ) {}

  private async computeTotal(
    items: { menu: string; quantity: number }[],
  ): Promise<number> {
    const ids = Array.from(new Set(items.map((i) => i.menu)));
    const menus = (await this.menuModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec()) as Array<{ _id: unknown; price?: unknown }>;
    if (menus.length !== ids.length) {
      throw new BadRequestException('One or more menu items not found');
    }
    const priceMap = new Map<string, number>();
    menus.forEach((m) => priceMap.set(String(m._id), Number(m.price ?? 0)));
    let total = 0;
    for (const it of items) {
      const price = priceMap.get(it.menu);
      if (price === undefined)
        throw new BadRequestException('Menu item not found');
      total += price * it.quantity;
    }
    return total;
  }

  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(createOrderDto.user)) {
      throw new BadRequestException('Invalid user id');
    }
    for (const it of createOrderDto.items) {
      if (!Types.ObjectId.isValid(it.menu))
        throw new BadRequestException('Invalid menu id');
    }
    const total = await this.computeTotal(createOrderDto.items);
    const created = new this.orderModel({ ...createOrderDto, total } as any);
    const saved = (await created.save()) as OrderDocument;
    return this.orderModel
      .findById(saved._id)
      .populate('user', 'name email')
      .populate('items.menu', 'name price')
      .lean()
      .exec() as unknown as Record<string, unknown>;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    return this.orderModel
      .find()
      .populate('user', 'name email')
      .populate('items.menu', 'name price')
      .lean()
      .exec() as unknown as Record<string, unknown>[];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid id');
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'name email')
      .populate('items.menu', 'name price')
      .lean()
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order as unknown as Record<string, unknown>;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Record<string, unknown>> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid id');
    const dto: UpdateQuery<OrderDocument> =
      updateOrderDto as unknown as UpdateQuery<OrderDocument>;
    const dtoObj = dto as Record<string, unknown>;
    let updatePayload: Record<string, unknown> = { ...dtoObj };
    if (dtoObj.items && Array.isArray(dtoObj.items)) {
      const items = dtoObj.items as Array<Record<string, unknown>>;
      for (const it of items) {
        if (typeof it.menu !== 'string' || !Types.ObjectId.isValid(it.menu))
          throw new BadRequestException('Invalid menu id');
      }
      const total = await this.computeTotal(
        items as { menu: string; quantity: number }[],
      );
      updatePayload = { ...updatePayload, total };
    }
    const updateQuery = updatePayload as unknown as UpdateQuery<OrderDocument>;
    const updated = await this.orderModel
      .findByIdAndUpdate(id, updateQuery, {
        new: true,
        runValidators: true,
      })
      .populate('user', 'name email')
      .populate('items.menu', 'name price')
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Order not found');
    return updated as unknown as Record<string, unknown>;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid id');
    const removed = await this.orderModel.findByIdAndDelete(id).exec();
    if (!removed) throw new NotFoundException('Order not found');
    return;
  }
}
