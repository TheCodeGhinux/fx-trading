import { AbstractBaseEntity } from "src/entities/base.entity";
import { Trade } from "src/modules/trades/entities/trade.entity";
import { Transactions } from "src/modules/transaction/entities/transaction.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Entity, ManyToOne, JoinColumn, Column, OneToMany, Unique } from "typeorm";

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY',
  ZAR = 'ZAR',
}

@Entity('wallets')
@Unique(['user_id', 'currency'])
export class Wallet extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @OneToMany(() => Transactions, transactions => transactions.wallet)
  transactions: Transactions[];

  @OneToMany(() => Trade, trade => trade.from_wallet)
  trades_from: Trade[];

  @OneToMany(() => Trade, trade => trade.to_wallet)
  trades_to: Trade[];
}
