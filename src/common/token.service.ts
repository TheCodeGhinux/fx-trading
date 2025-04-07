import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { CustomHttpException } from './custom.exception';
import * as SYS_MSG from './system-messages';
import { UserService } from 'src/modules/user/user.service';

export interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async verifyToken(
    token: string,
    request: Request,
  ): Promise<{ request: Request }> {
    try {
      const secret = this.configService.get<string>('auth.jwtSecret');
      if (!secret) {
        throw new CustomHttpException(
          SYS_MSG.INTERNAL_SERVER_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      const user = await this.userService.findUserByIdentifier('email', payload.email);
      request.user = {
        ...payload,
        isEmailVerified: user.is_verified,
      };

      (request as any).user = payload;
      return {
        request,
      };
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        throw new CustomHttpException(
          SYS_MSG.AUTH_TOKEN_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.AUTH_TOKEN_INVALID,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
