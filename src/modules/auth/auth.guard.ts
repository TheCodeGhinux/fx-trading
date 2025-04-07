import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpStatus,
} from '@nestjs/common';

import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import * as SYS_MSG from 'src/common/system-messages';
import { IS_PUBLIC_KEY } from 'src/decorators/skip-auth.decorator';
import { TokenService } from 'src/common/token.service';
import { CustomHttpException } from 'src/common/custom.exception';

export interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
  isEmailVerified: boolean;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    private tokenService: TokenService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    let request = context.switchToHttp().getRequest<Request>();
    const token = this.tokenService.extractTokenFromHeader(request);

    if (!token) {
      throw new CustomHttpException(
        SYS_MSG.AUTH_TOKEN_INVALID,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { request: updatedRequest } = await this.tokenService.verifyToken(
      token,
      request,
    );

    request = updatedRequest;
    return true;
  }
}
