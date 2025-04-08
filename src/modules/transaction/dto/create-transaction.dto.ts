import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { Currency } from '../../wallet/entities/wallet.entity';

export class CreateTransactionDto {
  @IsString()
  wallet_id: string;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  amount: number;

  @IsEnum(Currency, { message: 'Invalid currency' })
  currency: Currency;
}
