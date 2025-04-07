import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as SYS_MSG from 'src/common/system-messages';
import { FundWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletRepository } from './repoistory/wallet.repository';
import { User } from '../user/entities/user.entity';
import { CustomHttpException } from 'src/common/custom.exception';
import { UpdateWalletRecordOptions, WalletIdentifierMap, WalletIdentifierType } from './interfaces/wallet.interface';
import { EntityManager } from 'typeorm';
import { TransactionType } from '../transaction/entities/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class WalletService {
  constructor(
    public readonly repo: WalletRepository,
    private readonly transactionService: TransactionService,
    private readonly entityManager: EntityManager,
  ) {}

  async findWalletByIdentifier<K extends WalletIdentifierType>(
    identifierType: K, 
    identifier: WalletIdentifierMap[K],
    queryOptions?: object,
    relations?: object,
  ) {
    const query = { [identifierType]: identifier };
    const wallet = await this.repo.get(query, queryOptions, relations);
    
    if (!wallet) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_NOT_FOUD('Wallet'),
        HttpStatus.NOT_FOUND,
      );
    }
    
    return wallet;
  }


  // Lock wallet to prevent concurrent updates
  // const wallet = await transactionManager.getRepository(this.model).findOne({
  //   where: { user_id: user.id, currency: payload.currency },
  //   lock: { mode: 'pessimistic_write' }
  // });

  async fundWallet(user: User, payload: FundWalletDto) {
    return this.entityManager.transaction(async (transactionManager) => {
      try {

        const wallet = await this.repo.getWithManager(
          transactionManager,
          { user_id: user.id, currency: payload.currency },
          { lock: { mode: 'pessimistic_write' } },
        );

        if (!wallet) {
          throw new CustomHttpException(SYS_MSG.RESOURCE_NOT_FOUD('Wallet', wallet.id), HttpStatus.NOT_FOUND);
        }

        const updatedWallet = await this.repo.update({
          updatePayload: { balance: () => `balance + ${payload.amount}` },
          identifierOptions: { id: wallet.id },
          transactionOptions: { useTransaction: true, transaction: transactionManager },
        });

        if (!updatedWallet) {
          throw new CustomHttpException('Failed to update wallet balance', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const transactionType = TransactionType.FUND;
        const metadata = {
          fundingSource:  'fund',
          initiatedAt: new Date().toISOString()
        };

        const transaction = await this.transactionService.createWithTransaction(
          user,
          {
            amount: payload.amount,
            currency: wallet.currency,
            wallet_id: wallet.id,
          },
          transactionType,
          metadata,
          transactionManager
        );

        return {
          message: 'Wallet funded successfully',
          data: {
            wallet: updatedWallet,
            transaction,
          },
        };
      } catch (error) {
        throw error instanceof HttpException
          ? error
          : new InternalServerErrorException(`Failed to fund wallet: ${error.message}`);
      }
    });
  }

  async fundWallett(user: User, payload: FundWalletDto) {
    const {amount }= payload

    const newBalance =+ amount

    const wallet = await this.findWalletByIdentifier('user_id', user.id)

    const updateWalletBalance: UpdateWalletRecordOptions = {
      updatePayload: {balance: newBalance},
      identifierOptions: {id: wallet.id},
      transactionOptions: {useTransaction: false}
    }

    return {
      message: SYS_MSG.WALLET_FUNDED,
      data: updateWalletBalance
    }
  }

  findAll() {
    return `This action returns all wallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
