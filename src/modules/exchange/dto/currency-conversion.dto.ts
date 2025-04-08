import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CurrencyConversionDto {
  @ApiProperty({
    description: 'Source currency code (e.g., USD, EUR)',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'Target currency code (e.g., EUR, JPY)',
    example: 'EUR',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Amount to convert',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CurrencyConversionResultDto {
  @ApiProperty({ example: 'USD' })
  from: string;

  @ApiProperty({ example: 'EUR' })
  to: string;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ example: 92.5 })
  result: number;

  @ApiProperty({ example: 0.925 })
  rate: number;

  @ApiProperty({ example: '2025-04-08T10:30:00.000Z' })
  timestamp: string;
}