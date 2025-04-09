import { forwardRef, Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './entities/trade.entity';
import { EntitySchema } from 'typeorm';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { TransactionModule } from '../transaction/transaction.module';
import { TradeRepository } from './repositories/trade.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trade, EntitySchema]),
    UserModule, forwardRef(() => WalletModule), ExchangeModule, TransactionModule
  ],
  controllers: [TradesController],
  providers: [TradesService, TradeRepository],
  exports: [TradesService]
})
export class TradesModule {}
