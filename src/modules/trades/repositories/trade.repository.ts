import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractModelAction } from 'src/common/abstract/abstract-model-action';
import { Trade } from '../entities/trade.entity';

@Injectable()
export class TradeRepository extends AbstractModelAction<Trade> {
  constructor(
    @InjectRepository(Trade)
    repository: Repository<Trade>,
  ) {
    super(repository, Trade);
  }
}