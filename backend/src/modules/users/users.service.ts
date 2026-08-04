import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../database';

interface CreateUserInput {
  email: string;
  passwordHash: string;
}

/**
 * Data access for the User model. No HTTP-facing CRUD yet — these methods
 * exist for AuthModule to look up/create accounts. Broader user management
 * (profile updates, admin listing, etc.) is a later feature.
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
}
