import { IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/modules/wallet/entities/wallet.entity';

export class CreateTradeDto {
  @ApiProperty({
    description: 'Currency to trade from (e.g., NGN)',
    enum: Currency,
    example: Currency.NGN,
  })
  @IsEnum(Currency, { message: 'fromCurrency must be a valid currency' })
  fromCurrency: Currency;

  @ApiProperty({
    description: 'Currency to trade to (e.g., USD)',
    enum: Currency,
    example: Currency.USD,
  })
  @IsEnum(Currency, { message: 'toCurrency must be a valid currency' })
  toCurrency: Currency;

  @ApiProperty({
    description: 'Amount to trade in the fromCurrency',
    example: 1000.00,
    type: Number,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  amount: number;
}
