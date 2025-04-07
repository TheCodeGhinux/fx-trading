import { HttpStatus, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
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
import { User } from '../user/entities/user.entity';
import authConfig from 'src/config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly walletService: WalletService,
    private readonly entityManager: EntityManager,
  ) {
  }
  async registerUser(payload: CreateUserDto) {
    return this.entityManager.transaction(async (transactionManager) => {
      console.log("Secret key: ", authConfig().jwtSecret)

      const {email, password, first_name, last_name} = payload
      const existingUser = await this.userService.userRepository.get({email})
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

      return { message: SYS_MSG.RESOURCE_CREATED('User'), data: {token: verificationToken, user}};
    });
  }

  async verifyEmail(payload: VerifyEmailDto) {
    const { email, otp: code } = payload;

    const { valid, otp } = await this.otpService.validateOtp(email, code);
    if (!valid) {
      throw new CustomHttpException(SYS_MSG.RESOURCE_INVALID('Otp'), HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.entityManager.transaction(async (transactionManager) => {
        let user = await this.userService.findUserByIdentifier('email', email);

        user.is_verified = true;
        await this.userService.userRepository.update({
          updatePayload: user,
          identifierOptions: { id: user.id },
          transactionOptions: { useTransaction: true, transaction: transactionManager },
        });

        const wallets = await this.walletService.repo.list({
          filterRecordOptions: { user_id: user.id },
        });

        if (wallets.payload.length === 0) {
          await this.walletService.repo.create({
            createPayload: {
              user_id: user.id,
              currency: Currency.NGN,
              balance: 0,
            },
            transactionOptions: { useTransaction: true, transaction: transactionManager },
          });
        }

        user = await this.userService.findUserByIdentifier('id', user.id);

        return { message: 'Email verified successfully', data: user };
      });
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new CustomHttpException(SYS_MSG.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      if (valid && otp) {
        await this.otpService.otpRepository.delete({
          identifierOptions: { id: otp.id },
          transactionOptions: { useTransaction: false },
        });
      }
    }
  }

}
