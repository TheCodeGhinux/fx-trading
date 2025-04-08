import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletRepository } from './repoistory/wallet.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { EntitySchema } from 'typeorm';
import { TransactionModule } from '../transaction/transaction.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, EntitySchema]), TransactionModule, ExchangeModule, UserModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletService, WalletRepository]
})
export class WalletModule {}
