import { CreateRecordGeneric, UpdateRecordGeneric } from 'src/common/interfaces/repository';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';

export interface TransactionInterface {
  id: string;
  user_id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status?: TransactionStatus;
  reference?: string;
  metadata?: Record<string, any>;
}

interface CreateTransactionRecordPayload extends Partial<TransactionInterface> {}

export interface CreateTransactionRecordOptions extends CreateRecordGeneric<CreateTransactionRecordPayload> {}

export interface UpdateWalletRecordOptions extends UpdateRecordGeneric<CreateTransactionRecordPayload, Record<string, unknown>> {}
