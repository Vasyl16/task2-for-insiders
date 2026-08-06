import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role, type User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import type { PrismaService } from '../database';

jest.mock('bcryptjs');

describe('UsersService', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  function buildUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed-old-password',
      role: Role.USER,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock; create: jest.Mock } };
  let usersService: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    usersService = new UsersService(prisma as unknown as PrismaService);
  });

  describe('getProfile', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(usersService.getProfile('user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the profile without the password hash', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());

      const result = await usersService.getProfile('user-1');

      expect(result).toEqual({
        id: 'user-1',
        email: 'user@example.com',
        role: Role.USER,
        createdAt: now,
        updatedAt: now,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('updateEmail', () => {
    it('updates and returns the new profile', async () => {
      prisma.user.update.mockResolvedValue(buildUser({ email: 'new@example.com' }));

      const result = await usersService.updateEmail('user-1', 'new@example.com');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { email: 'new@example.com' },
      });
      expect(result.email).toBe('new@example.com');
    });

    it('throws ConflictException when the email is already taken', async () => {
      prisma.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.19.0',
        }),
      );

      await expect(usersService.updateEmail('user-1', 'taken@example.com')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('changePassword', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.changePassword('user-1', 'oldPassword1', 'newPassword1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws UnauthorizedException when the current password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        usersService.changePassword('user-1', 'wrongPassword', 'newPassword1'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('hashes and stores the new password when the current password matches', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');

      await usersService.changePassword('user-1', 'oldPassword1', 'newPassword1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'hashed-new-password' },
      });
    });
  });
});
