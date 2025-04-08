import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRepository } from './repositories/transaction.repository';
import { generateReferenceNumber } from 'src/common/helpers/reference-number.helper';
import { CreateTransactionRecordOptions } from './interfaces/transaction.interface'
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { TransactionStatus, TransactionType } from './entities/transaction.entity';
import { CustomHttpException } from 'src/common/custom.exception';
import * as SYS_MSG from 'src/common/system-messages';
import { EntityManager } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly entityManager: EntityManager
  ) {}

  async create(user: User, payload: CreateTransactionDto, type: TransactionType, metadata: Record<string, any>) {
    return this.createWithTransaction(user, payload, type, metadata);
  }

  async createWithTransaction(
    user: User,
    payload: CreateTransactionDto,
    type: TransactionType,
    metadata: Record<string, any>,
    transactionManager?: EntityManager
  ) {
    console.log("Creating tx ---------------------")
    const referenceNumber = generateReferenceNumber();

    const createTransactionPayload: CreateTransactionRecordOptions = {
      createPayload: {
        user_id: user.id,
        wallet_id: payload.wallet_id,
        type,
        amount: payload.amount,
        currency: payload.currency,
        status: TransactionStatus.COMPLETED,
        reference: referenceNumber,
        metadata,
      },
      transactionOptions: {
        useTransaction: !!transactionManager,
        transaction: transactionManager
      }
    };

    console.log("Transaction entity value: ", !!transactionManager)
    const transaction = await this.transactionRepository.create(createTransactionPayload);

    if (!transaction) {
      throw new CustomHttpException('Failed to create transaction record', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return transaction;
  }
}
