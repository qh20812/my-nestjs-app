import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import User, { UserDocument } from './entities/user.entity';
import { Model, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Record<string, unknown>> {
    try {
      const hashed = await bcrypt.hash(createUserDto.password, 10);
      const created = new this.userModel({
        ...(createUserDto as any),
        password: hashed,
      });
      const saved = await created.save();
      const savedObj = saved.toObject() as unknown as Record<string, unknown>;
      if ('password' in savedObj) {
        delete savedObj['password'];
      }
      return savedObj;
    } catch (err: unknown) {
      const maybe = err as { code?: unknown };
      if (typeof maybe.code === 'number' && maybe.code === 11000) {
        throw new ConflictException('Email or phone already exists');
      }
      throw err;
    }
  }

  async findAll(): Promise<Partial<User>[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Record<string, unknown>> {
    const dto: UpdateQuery<UserDocument> = {
      ...(updateUserDto as any),
    } as UpdateQuery<UserDocument>;
    const dtoObj = dto as Record<string, unknown>;
    if (typeof dtoObj['password'] === 'string') {
      dtoObj['password'] = await bcrypt.hash(dtoObj['password'], 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, dtoObj as UpdateQuery<UserDocument>, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as unknown as Record<string, unknown>;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return;
  }
}
