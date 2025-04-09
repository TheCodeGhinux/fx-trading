import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { TradesModule } from './modules/trades/trades.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { WalletModule } from './modules/wallet/wallet.module';
import dataSource from 'src/database/data-source';
import { ConfigModule, ConfigService } from "@nestjs/config";
import authConfig from './config/auth.config';
import { validateEnv } from './common/env.validator';
import { TokenService } from './common/token.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { EmailModule } from './modules/email/email.module';
import config from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [authConfig, config ],
    }),
    TypeOrmModule.forRootAsync({
    useFactory: () => ({
      ...dataSource.options,
    }),
    dataSourceFactory: async () => {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      return dataSource;
    },
  }),
  AuthModule, UserModule, WalletModule, TransactionModule, TradesModule, ExchangeModule, EmailModule],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    JwtService,
    {
    provide: APP_GUARD,
    useClass: AuthGuard,
    },
    {
      provide: "CONFIG",
      useClass: ConfigService,
    },
    {
      provide: TokenService,
      useClass: TokenService,
    },
],
})
export class AppModule {}
