import { Controller, HttpCode, HttpStatus, Post, Req, Res, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { Public } from '../../common/decorators';
import { AuthService, type AuthTokens } from './auth.service';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an account and start a session' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email is already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.register(dto);
    return this.respondWithTokens(tokens, res);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.login(dto);
    return this.respondWithTokens(tokens, res);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Missing, invalid, or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.refresh(req.cookies?.[REFRESH_TOKEN_COOKIE]);
    return this.respondWithTokens(tokens, res);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the refresh token and clear its cookie' })
  @ApiResponse({ status: 204 })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions());
  }

  private respondWithTokens(tokens: AuthTokens, res: Response): AuthResponseDto {
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.cookieOptions());
    return { user: tokens.user, accessToken: tokens.accessToken };
  }

  private cookieOptions(): CookieOptions {
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    const apiPrefix = this.configService.get<string>('app.apiPrefix');
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: `/${apiPrefix}/auth`,
    };
  }
}
