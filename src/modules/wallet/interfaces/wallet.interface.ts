import { CreateRecordGeneric, UpdateRecordGeneric } from "src/common/interfaces/repository";
import { Trade } from "src/modules/trades/entities/trade.entity";
import { Transactions } from "src/modules/transaction/entities/transaction.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Currency } from "../entities/wallet.entity";

export interface WalletInterface {
  user?: User;
  user_id: string;
  currency: Currency;
  balance: number;
  transactions?: Transactions[];
  trades_from?: Trade[];
  trades_to?: Trade[];
}


export type WalletIdentifierType = 'id' | 'user_id' | 'account_number';

export interface WalletIdentifierMap {
  id: string;
  user_id: string;
  account_number: string;
};

interface CreateWalletRecordPayload extends Partial<WalletInterface> {}

export interface CreateWalletRecordOptions extends CreateRecordGeneric<CreateWalletRecordPayload> {}

export interface UpdateWalletRecordOptions extends UpdateRecordGeneric<CreateWalletRecordPayload, Record<string, unknown>> {}
