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

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useFactory: () => ({
      ...dataSource.options,
    }),
    dataSourceFactory: async () => {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      return dataSource;
    },
  }), AuthModule, UserModule, WalletModule, TransactionModule, TradesModule, ExchangeModule],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
