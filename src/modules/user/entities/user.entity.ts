import { AbstractBaseEntity } from "src/entities/base.entity";
import { Trade } from "src/modules/trades/entities/trade.entity";
import { Transactions } from "src/modules/transaction/entities/transaction.entity";
import { Wallet } from "src/modules/wallet/entities/wallet.entity";
import { Column, OneToMany } from "typeorm";

export class User extends AbstractBaseEntity {
  @Column({ nullable: false })
  email: string

  @Column({ nullable: false })
  first_name: string

  @Column({ nullable: false })
  last_name: string

  @Column({ name: 'is_email_verified', default: false })
  is_verified: boolean;

  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Transactions, transactions => transactions.user)
  transactions: Transactions[];

  @OneToMany(() => Trade, trade => trade.user)
  trades: Trade[];

}
