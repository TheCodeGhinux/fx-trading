import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto, LoginUserDto } from '../user/dto/create-user.dto';
import { AuthDocs } from './docs/auth.docs';
import { VerifyEmailDto } from './dto/auth.dto';
import { SkipAuth } from 'src/decorators/skip-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthDocs.register()
  @SkipAuth()
  @Post('register')
  register(@Body() payload: CreateUserDto) {
    return this.authService.registerUser(payload);
  }

  @SkipAuth()
  @Post('login')
  loginUser(@Body() payload: LoginUserDto) {
    return this.authService.loginUser(payload);
  }

  @SkipAuth()
  @Post('verify-email')
  async verifyEmail(@Body() payload: VerifyEmailDto) {
    return this.authService.verifyEmail(payload);
  }

}
