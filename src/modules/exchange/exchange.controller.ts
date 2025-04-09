import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrencyConversionDto, CurrencyConversionResultDto } from './dto/currency-conversion.dto';

@Controller('fx')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get()
  async getAllRates() {
    const rates = await this.exchangeService.getAllRates();
    return {
      rates,
      lastUpdated: this.exchangeService.getLastUpdated(),
    };
  }

  @Get(':fromCurrency/:toCurrency')
  async getRate(@Param('fromCurrency') fromCurrency: string, @Param('toCurrency') toCurrency: string) {
    const rate = await this.exchangeService.getRate(fromCurrency, toCurrency);
    return {
      from: fromCurrency.toUpperCase(),
      to: toCurrency.toUpperCase(),
      rate,
      lastUpdated: this.exchangeService.getLastUpdated(),
    };
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert amount from one currency to another' })
  @ApiResponse({
    status: 200,
    description: 'Returns the converted amount',
    type: CurrencyConversionResultDto
  })
  async convertCurrency(@Body() conversionDto: CurrencyConversionDto) {
    return this.exchangeService.convertCurrency(
      conversionDto.from,
      conversionDto.to,
      conversionDto.amount
    );
  }
}
