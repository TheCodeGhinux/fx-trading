import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletRepository } from './repoistory/wallet.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { EntitySchema } from 'typeorm';
import { TransactionModule } from '../transaction/transaction.module';
import { ExchangeModule } from '../exchange/exchange.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, EntitySchema]), TransactionModule, ExchangeModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletService, WalletRepository]
})
export class WalletModule {}
