import { AbstractBaseEntity } from "src/entities/base.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Wallet } from "src/modules/wallet/entities/wallet.entity";
import { Entity, ManyToOne, JoinColumn, Column } from "typeorm";

@Entity('trades')
export class Trade extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.trades)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Wallet, wallet => wallet.trades_from)
  @JoinColumn({ name: 'from_wallet_id' })
  from_wallet: Wallet;

  @Column()
  from_wallet_id: string;

  @ManyToOne(() => Wallet, wallet => wallet.trades_to)
  @JoinColumn({ name: 'to_wallet_id' })
  to_wallet: Wallet;

  @Column()
  to_wallet_id: string;

  @Column()
  from_currency: string;

  @Column()
  to_currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'result_amount', type: 'decimal', precision: 18, scale: 2 })
  result_amount: number;
}
