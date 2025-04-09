import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { OtpService } from '../auth/otp.service';
import { OtpRepository } from './repositories/otp.repository';
import { Otp } from './entities/otp.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp, EntitySchema]), EmailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, OtpService, OtpRepository],
  exports: [UserService, OtpService]
})
export class UserModule {}
