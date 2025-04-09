import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto, LoginUserDto } from '../user/dto/create-user.dto';
import { AuthDocs } from './docs/auth.docs';
import { ResendOtpDto, VerifyEmailDto } from './dto/auth.dto';
import { SkipAuth } from 'src/decorators/skip-auth.decorator';
import { OtpService } from './otp.service';
import { CustomHttpException } from 'src/common/custom.exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly otpService: OtpService) {}

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

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    try {
      await this.otpService.resendOtp(resendOtpDto.email);
      return { message: 'OTP resent successfully' };
    } catch (error) {
      throw new CustomHttpException('Failed to resend OTP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
