import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Currency } from "../entities/wallet.entity";
import { ApiProperty } from "@nestjs/swagger";

export class FundWalletDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number
  
  @IsString()
  @IsNotEmpty()
  currency: Currency
}

export class WalletDto {
  @ApiProperty({ example: '9f04e52b-5272-4b14-b6f1-2457b0de63dc' })
  id: string;

  @ApiProperty({ example: '3e9b9ed4-71c5-4d9e-8f40-2f3f61a249eb' })
  user_id: string;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  currency: Currency;

  @ApiProperty({ example: 5000.75, description: 'Wallet balance with up to 2 decimal places' })
  balance: number;

  @ApiProperty({ example: '2025-04-07T12:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-04-07T12:00:00.000Z' })
  updated_at: Date;
}
