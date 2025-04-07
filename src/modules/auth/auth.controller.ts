import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthDocs } from './docs/auth.docs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthDocs.register()
  @Post('register')
  register(@Body() payload: CreateUserDto) {
    return this.authService.registerUser(payload);
  }
}
