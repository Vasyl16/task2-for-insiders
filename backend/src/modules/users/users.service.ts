import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database';
import { SALT_ROUNDS } from './users.constants';
import type { UserResponseDto } from './dto';

interface CreateUserInput {
  email: string;
  passwordHash: string;
}

/**
 * Data access for the User model. Also backs AuthModule's account
 * lookup/creation and the profile endpoints on UsersController.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getProfile(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponse(user);
  }

  async updateEmail(id: string, email: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({ where: { id }, data: { email } });
      return this.toResponse(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email is already in use');
      }
      throw error;
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
