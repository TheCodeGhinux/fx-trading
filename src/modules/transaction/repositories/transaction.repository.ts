import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from 'src/common/abstract/abstract-model-action';
import { Transactions } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository extends AbstractModelAction<Transactions> {
  constructor(
    @InjectRepository(Transactions)
    repository: Repository<Transactions>,
  ) {
    super(repository, Transactions);
  }
}