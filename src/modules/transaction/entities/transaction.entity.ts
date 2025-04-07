import { AbstractBaseEntity } from "src/entities/base.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Wallet } from "src/modules/wallet/entities/wallet.entity";
import { Entity, ManyToOne, JoinColumn, Column } from "typeorm";


export enum TransactionType {
  FUND = 'fund',
  TRANSFER = 'transfer',
  TRADE = 'trade',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TransactionStatus {

}
@Entity('transactions')
export class Transactions extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column()
  wallet_id: string;

  @Column({type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ unique: true })
  reference: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
