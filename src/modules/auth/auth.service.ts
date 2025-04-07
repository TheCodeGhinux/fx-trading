import { HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { EntityManager } from 'typeorm';
import { CreateUserRecordOptions } from '../user/interfaces/user.inteface';
import { CustomHttpException } from 'src/common/custom.exception';
import * as SYS_MSG from 'src/common/system-messages'
import { OtpService } from './otp.service';
import { JwtService } from '@nestjs/jwt';
import { VerifyEmailDto } from './dto/auth.dto';
import { Currency } from '../wallet/entities/wallet.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly entityManager: EntityManager,
  ) {
  }
  async registerUser(payload: CreateUserDto) {
    return this.entityManager.transaction(async (transactionManager) => {

      const {email, password, first_name, last_name} = payload
      const existingUser = await this.userService.findUserByIdentifier('email', email)
      if (existingUser) {
        throw new CustomHttpException(SYS_MSG.RESOURCE_EXISTS('User'), HttpStatus.BAD_REQUEST)
      };

      const hashedPassword = await hash(password, 10);

      const createPayload = {
        email: email,
        password: hashedPassword,
        first_name,
        last_name,
        is_verified: false,
      }

      const createUserPayload: CreateUserRecordOptions = {
        createPayload, transactionOptions: { useTransaction: true, transaction: transactionManager }
      }
      const user = await this.userService.createUser(createUserPayload);
      const verificationToken = this.jwtService.sign(
        { email, purpose: 'verify-email' },
        { expiresIn: '1hr' },
      );
      await this.otpService.generateAndSendOtp(user.email);

      return { message: SYS_MSG.RESOURCE_CREATED('User'), data: {toke: verificationToken, user}};
    });
  }
}
