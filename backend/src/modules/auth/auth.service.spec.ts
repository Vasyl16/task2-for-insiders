import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { Prisma, Role, type User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import type { PrismaService } from '../database';
import type { UsersService } from '../users';

jest.mock('bcryptjs');

describe('AuthService', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const user: User = {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    role: Role.USER,
    createdAt: now,
    updatedAt: now,
  };

  let usersService: jest.Mocked<Pick<UsersService, 'create' | 'findByEmail' | 'findById'>>;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync' | 'verifyAsync' | 'decode'>>;
  let configService: { get: jest.Mock };
  let authService: AuthService;

  const config: Record<string, string> = {
    'jwt.accessSecret': 'access-secret',
    'jwt.accessExpiresIn': '15m',
    'jwt.refreshSecret': 'refresh-secret',
    'jwt.refreshExpiresIn': '7d',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => config[key]),
    };

    jwtService.signAsync.mockImplementation(async (_payload, options) =>
      options?.secret === config['jwt.refreshSecret']
        ? 'signed-refresh-token'
        : 'signed-access-token',
    );
    jwtService.decode.mockReturnValue({ exp: Math.floor(now.getTime() / 1000) + 7 * 24 * 60 * 60 });

    authService = new AuthService(
      usersService as unknown as UsersService,
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  describe('register', () => {
    it('hashes the password, creates the user, and issues a token pair', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue(user);

      const result = await authService.register({ email: user.email, password: 'plain-password' });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', expect.any(Number));
      expect(usersService.create).toHaveBeenCalledWith({
        email: user.email,
        passwordHash: 'hashed-password',
      });
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
        accessToken: 'signed-access-token',
        refreshToken: 'signed-refresh-token',
      });
    });

    it('translates a duplicate-email constraint into a ConflictException', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: '5.22.0',
        }),
      );

      await expect(
        authService.register({ email: user.email, password: 'plain-password' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('issues a token pair when the password matches', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({ email: user.email, password: 'plain-password' });

      expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', user.passwordHash);
      expect(result.accessToken).toBe('signed-access-token');
    });

    it('rejects when no user exists for the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'missing@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: user.email, password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rejects when no token is presented', async () => {
      await expect(authService.refresh(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when the token fails signature/expiry verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));

      await expect(authService.refresh('raw-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when the token is not found, revoked, or expired', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: user.id });
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refresh('raw-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rotates the token and issues a new pair on success', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: user.id });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        tokenHash: 'hash',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      usersService.findById.mockResolvedValue(user);

      const result = await authService.refresh('raw-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result.accessToken).toBe('signed-access-token');
      expect(result.refreshToken).toBe('signed-refresh-token');
    });
  });

  describe('logout', () => {
    it('is a no-op when no token is presented', async () => {
      await authService.logout(undefined);
      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    it('revokes the matching, still-active token', async () => {
      await authService.logout('raw-token');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: expect.any(String), revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
