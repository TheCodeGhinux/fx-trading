import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as SYS_MSG from 'src/common/system-messages';
import { FundWalletDto, TransferFundsDto } from './dto/wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletRepository } from './repoistory/wallet.repository';
import { User } from '../user/entities/user.entity';
import { CustomHttpException } from 'src/common/custom.exception';
import { UpdateWalletRecordOptions, WalletIdentifierMap, WalletIdentifierType } from './interfaces/wallet.interface';
import { EntityManager } from 'typeorm';
import { TransactionType } from '../transaction/entities/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class WalletService {
  constructor(
    public readonly repo: WalletRepository,
    private readonly transactionService: TransactionService,
    private readonly exchangeService: ExchangeService,
    private readonly entityManager: EntityManager,
  ) {}

  async generateAccountNumber(): Promise<string> {
    let accountNumber = '';
    let isUnique = false;

    while (!isUnique) {
      const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(7, '0');
      accountNumber = `686${randomPart}`;

      const existingWallet = await this.findWalletByIdentifier('account_number', accountNumber);

      if (!existingWallet) {
        isUnique = true;
      }
    }

    return accountNumber;
  }

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

  async transferFunds(
    user: User,
    payload: TransferFundsDto
  ): Promise<void> {
    return this.entityManager.transaction(async (transactionManager) => {
      try {
        // Lock both wallets for processing
        const [fromWallet, toWallet] = await Promise.all([
          this.repo.getWithManager(transactionManager, {
            where: { user_id: user.id, currency: payload.currency  },
            lock: { mode: 'pessimistic_write' }
          }),
          this.repo.getWithManager(transactionManager, {
            where: { id: payload.accountNumber },
            lock: { mode: 'pessimistic_write' }
          })
        ]);

        if (fromWallet.balance < payload.amount) {
          throw new CustomHttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
        }

        const isCrossCurrency = fromWallet.currency !== toWallet.currency;
        let transferAmount = payload.amount;
        let conversionRate = 1;

        if (isCrossCurrency) {
          const conversionResult = await this.exchangeService.convert(
            fromWallet.currency,
            toWallet.currency,
            payload.amount
          );
          transferAmount = conversionResult.result;
          conversionRate = conversionResult.rate;
        }

        const metadata = {
          initiatedAt: new Date().toISOString(),
          transferType: isCrossCurrency ? 'cross-currency' : 'same-currency',
          ...(isCrossCurrency && {
            conversionRate,
            convertedAmount: transferAmount
          })
        };

        await Promise.all([
          this.transactionService.createWithTransaction(
            fromWallet.user,
            {
              amount: payload.amount,
              currency: fromWallet.currency,
              wallet_id: fromWallet.id,
            },
            TransactionType.DEBIT,
            metadata,
            transactionManager
          ),
          this.transactionService.createWithTransaction(
            toWallet.user,
            {
              amount: transferAmount,
              currency: toWallet.currency,
              wallet_id: toWallet.id,
            },
            TransactionType.CREDIT,
            metadata,
            transactionManager
          )
        ]);

        await Promise.all([
          this.repo.update({
            updatePayload: { balance: () => `balance - ${payload.amount}` },
            identifierOptions: { id: fromWallet.id },
            transactionOptions: { useTransaction: true, transaction: transactionManager },
          }),
          this.repo.update({
            updatePayload: { balance: () => `balance + ${transferAmount}` },
            identifierOptions: { id: toWallet.id },
            transactionOptions: { useTransaction: true, transaction: transactionManager },
          })
        ]);
      } catch (error) {
        throw error instanceof HttpException
          ? error
          : new InternalServerErrorException(`Failed to transfer funds: ${error.message}`);
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
