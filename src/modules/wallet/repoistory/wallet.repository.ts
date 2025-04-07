import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from 'src/common/abstract/abstract-model-action';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class WalletRepository extends AbstractModelAction<Wallet> {
  constructor(
    @InjectRepository(Wallet)
    repository: Repository<Wallet>,
  ) {
    super(repository, Wallet);
  }
}