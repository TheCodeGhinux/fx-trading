import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { Cron, CronExpression } from '@nestjs/schedule'
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import * as SYS_MSG from 'src/common/system-messages'
import config from "src/config/configuration";


interface ExchangeRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

@Injectable()
export class ExchangeService implements OnModuleInit {
  private readonly API_KEY = config().exchange.secret;
  private readonly BASE_URL = config().exchange.url;
  private cachedRates: Record<string, any> = {};
  private lastUpdated: Date = null;
  private cacheExpiryMinutes = 60;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.fetchAndCacheRates('USD');
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async refreshRates() {
    await this.fetchAndCacheRates('USD');

    const commonCurrencies = ['EUR', 'GBP', 'JPY'];
    for (const currency of commonCurrencies) {
      if (currency !== 'USD') {
        await this.fetchAndCacheRates(currency);
      }
    }
  }

  private async fetchAndCacheRates(currency: string): Promise<void> {
    currency = currency.toUpperCase()
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<ExchangeRateResponse>(`${this.BASE_URL}/${this.API_KEY}/latest/${currency}`)
          .pipe(
            catchError((error: AxiosError) => {
              console.error(`Error fetching exchange rates for ${currency}: ${error.message}`);
              throw `An error occurred while fetching exchange rates ${currency}: ${error.message}`;
            }),
          ),
      );

      this.cachedRates[currency] = data.conversion_rates;
      this.lastUpdated = new Date();
      console.log(`Exchange rates updated  for ${currency} successfully`);

    } catch (error) {
      console.error(`Failed to update exchange rates ${currency}: ${error}`);
      if (Object.keys(this.cachedRates).length === 0) {
        throw new Error('Failed to fetch exchange rates and no cached rates available');
      }
    }
  }

  async getRate(from: string, to: string): Promise<number> {
    from = from.toUpperCase();
    to = to.toUpperCase();

    if (!this.cachedRates[from] || this.isCacheExpired()) {
      await this.fetchAndCacheRates(from);
    }

    if (!this.cachedRates[from]) {
      if (from !== 'USD' && to !== 'USD') {
        if (!this.cachedRates['USD'] || this.isCacheExpired()) {
          await this.fetchAndCacheRates('USD');
        }
        const fromToUSD = 1 / this.cachedRates['USD'][from];
        const usdToTarget = this.cachedRates['USD'][to];

        if (!fromToUSD || !usdToTarget) {
          throw new Error(`Cannot find conversion rate from ${from} to ${to}`);
        }

        return fromToUSD * usdToTarget;
      }
      throw new Error(`Exchange rates not available for base currency: ${from}`);
    }

    const rate = this.cachedRates[from][to];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} to ${to}`);
    }

    return rate;
  }

  async convert(from: string, to: string, amount: number): Promise<{
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    timestamp: Date;
  }> {
    const rate = await this.getRate(from, to);
    const result = amount * rate;

    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount,
      result,
      rate,
      timestamp: this.lastUpdated || new Date()
    };
  }

  async convertCurrency(from: string, to: string, amount: number) {
    const responseData = await this.convert(from, to, amount);

    return {
      message: SYS_MSG.RESOURCE_SUCESS('Currency', 'converted'),
      data: responseData
    };
  }

  async getAllRates(currency: string = 'USD'): Promise<Record<string, number>> {
    currency = currency.toUpperCase()

    if (!this.lastUpdated[currency] || this.isCacheExpired()) {
      await this.fetchAndCacheRates(currency ?? 'USD');
    }

    return { ...this.cachedRates[currency] };
  }

  getLastUpdated(): Date {
    return this.lastUpdated;
  }

  private isCacheExpired(): boolean {
    if (!this.lastUpdated) return true;

    const now = new Date();
    const diffMs = now.getTime() - this.lastUpdated.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    return diffMinutes >= this.cacheExpiryMinutes;
  }
}
