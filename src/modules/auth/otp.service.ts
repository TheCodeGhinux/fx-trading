
import { Injectable } from '@nestjs/common';
import { OtpRepository } from '../user/repositories/otp.repository';
import { EntityManager } from 'typeorm';
import { Otp } from '../user/entities/otp.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

@Injectable()
export class OtpService {
  constructor(
    public readonly otpRepository: OtpRepository,
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

      // Send email logic here (mock implementation)
      console.log(`OTP for ${email}: ${code}`);

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
