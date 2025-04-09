
import { Injectable } from '@nestjs/common';
import { OtpRepository } from '../user/repositories/otp.repository';
import { EntityManager } from 'typeorm';
import { Otp } from '../user/entities/otp.entity';
import { EmailService } from '../email/email.service';

export interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

@Injectable()
export class OtpService {
  constructor(
    public readonly otpRepository: OtpRepository,
    private readonly  emailService: EmailService,
    private readonly entityManager: EntityManager,
  ) {}
  
  async findOtp() {

  }

  async generateAndSendOtp(email: string): Promise<string> {
    return this.entityManager.transaction(async (transactionManager) => {
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

      await this.otpRepository.create({
        createPayload: { email, code, expiresAt },
        transactionOptions: { useTransaction: true, transaction: transactionManager },
      });

      const mailContext = {
        appName: 'FxForage',
        code,
        expiresInMinutes: 15,
        year: new Date().getFullYear(),
        email,
      };

      try {
        await this.emailService.sendMail(
          email,
          'Your OTP Code',
          'otp-verification',
          mailContext,
        );
      } catch (error) {
        console.error(`Failed to send OTP email to ${email}:`, error.message);
        throw new Error('Failed to send OTP email');
      }
      
      // Log the code to console
      console.log(`OTP for ${email}: ${code}`);

      return code;
    });
  }

  async resendOtp(email: string): Promise<string> {
    return this.entityManager.transaction(async (transactionManager) => {
      const existingOtp = await this.otpRepository.get(
        { email },
        { order: { createdAt: 'DESC' } }
      );

      if (existingOtp && new Date() < existingOtp.expiresAt) {
        await this.otpRepository.delete({
          identifierOptions: { id: existingOtp.id },
          transactionOptions: { useTransaction: true, transaction: transactionManager },
        });
      }

      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.otpRepository.create({
        createPayload: { email, code, expiresAt },
        transactionOptions: { useTransaction: true, transaction: transactionManager },
      });

      const mailContext = {
        appName: 'FxForage',
        code,
        expiresInMinutes: 15,
        year: new Date().getFullYear(),
        email,
      };

      try {
        await this.emailService.sendMail(
          email,
          'Your OTP Code',
          'otp-verification',
          mailContext,
        );
      } catch (error) {
        console.error(`Failed to resend OTP email to ${email}:`, error.message);
        throw new Error('Failed to resend OTP email');
      }

      return code;
    });
  }


  async validateOtp(email: string, code: string): Promise<{ valid: boolean, otp?: Otp }> {
    const otp = await this.otpRepository.get(
      { email },
      { order: { createdAt: 'DESC' } }
    );

    if (!otp || otp.code !== code) {
      await this.incrementAttempts(otp?.id);
      return { valid: false };
    }

    if (new Date() > otp.expiresAt) {
      await this.otpRepository.delete({
        identifierOptions: { id: otp.id },
        transactionOptions: { useTransaction: false },
      });
      return { valid: false };
    }

    return { valid: true, otp };
  }


  private async incrementAttempts(otpId?: string) {
    if (otpId) {
      await this.otpRepository.update({
        updatePayload: { attempts: () => 'attempts + 1' },
        identifierOptions: { id: otpId },
        transactionOptions: { useTransaction: false },
      });
    }
  }
}
