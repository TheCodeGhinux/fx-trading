import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { CustomHttpException } from 'src/common/custom.exception';
import { EntityManager } from 'typeorm';
import { WalletService } from '../wallet/wallet.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ExchangeService } from '../exchange/exchange.service';
import { TransactionType } from '../transaction/entities/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { TradeRepository } from './repositories/trade.repository';

@Injectable()
export class TradesService {
  constructor(
    public readonly tradeRepo: TradeRepository,
    private readonly walletService: WalletService,
    private readonly userService: UserService,
    private readonly exchangeService: ExchangeService,
    private readonly transactionService: TransactionService,

    private readonly entityManager: EntityManager
  ) {}
  async executeTrade(user: User, payload: CreateTradeDto) {
    return this.entityManager.transaction(async (transactionManager: EntityManager) => {

      const [fromWallet, toWallet] = await Promise.all([
        this.walletService.repo.getWithManager(
          transactionManager,
          { user_id: user.id, currency: payload.fromCurrency },
          { lock: { mode: 'pessimistic_write' } }
        ),
        this.walletService.repo.getWithManager(
          transactionManager,
          { user_id: user.id, currency: payload.toCurrency },
          { lock: { mode: 'pessimistic_write' } }
        )
      ]);

      if (!fromWallet) {
        throw new CustomHttpException('Source wallet not found', HttpStatus.BAD_REQUEST);
      }
      if (!toWallet) {
        throw new CustomHttpException('Target wallet not found', HttpStatus.BAD_REQUEST);
      }

      if (!toWallet.user) {
        toWallet.user = await this.userService.findUserByIdentifier('id', toWallet.user_id);
      }
      if (Number(fromWallet.balance) < payload.amount) {
        throw new CustomHttpException('Insufficient funds in source wallet', HttpStatus.BAD_REQUEST);
      }

      const conversionResult = await this.exchangeService.convert(
        fromWallet.currency,
        toWallet.currency,
        payload.amount
      );
      const conversionRate = conversionResult.rate;
      const resultAmount = conversionResult.result;

      const metadata = {
        initiatedAt: new Date().toISOString(),
        tradeType: 'cross-currency',
        conversionRate,
        resultAmount
      };

      const fromUserTxPromise = this.transactionService.createWithTransaction(
        user,
        {
          amount: payload.amount,
          currency: fromWallet.currency,
          wallet_id: fromWallet.id,
        },
        TransactionType.DEBIT,
        metadata,
        transactionManager
      );

      const toUserTxPromise = this.transactionService.createWithTransaction(
        toWallet.user,
        {
          amount: resultAmount,
          currency: toWallet.currency,
          wallet_id: toWallet.id,
        },
        TransactionType.CREDIT,
        metadata,
        transactionManager
      );

      const [fromUserTx, toUserTx] = await Promise.all([
        fromUserTxPromise,
        toUserTxPromise
      ]);

      const updatedFromWalletPromise = this.walletService.repo.update({
        updatePayload: { balance: () => `balance - ${payload.amount}` },
        identifierOptions: { id: fromWallet.id },
        transactionOptions: { useTransaction: true, transaction: transactionManager },
      });

      const updatedToWalletPromise = this.walletService.repo.update({
        updatePayload: { balance: () => `balance + ${resultAmount}` },
        identifierOptions: { id: toWallet.id },
        transactionOptions: { useTransaction: true, transaction: transactionManager },
      });

      const [updatedFromWallet, updatedToWallet] = await Promise.all([
        updatedFromWalletPromise,
        updatedToWalletPromise
      ]);

      const tradePayload = {
        user_id: user.id,
        from_wallet_id: fromWallet.id,
        to_wallet_id: toWallet.id,
        from_currency: fromWallet.currency,
        to_currency: toWallet.currency,
        rate: conversionRate,
        amount: payload.amount,
        result_amount: resultAmount,
      };

      const trade = await this.tradeRepo.create({
        createPayload: tradePayload,
        transactionOptions: { useTransaction: true, transaction: transactionManager },
      });

      return {
        message: `Trade executed successfully: ${payload.amount} ${fromWallet.currency} exchanged to ${resultAmount} ${toWallet.currency}`,
        data: {
          trade,
          updatedFromWallet,
          updatedToWallet,
          fromUserTx,
          toUserTx,
        }
      };
    });
  }


  findAll() {
    return `This action returns all trades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trade`;
  }

  update(id: number, updateTradeDto: UpdateTradeDto) {
    return `This action updates a #${id} trade`;
  }

  remove(id: number) {
    return `This action removes a #${id} trade`;
  }
}
