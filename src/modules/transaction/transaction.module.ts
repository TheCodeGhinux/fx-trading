import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from './entities/transaction.entity';
import { EntitySchema } from 'typeorm';
import { TransactionRepository } from './repositories/transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transactions, EntitySchema])
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService]
})
export class TransactionModule {}
