import { AbstractBaseEntity } from "src/entities/base.entity";
import { Entity, Column } from "typeorm";

@Entity('exchange_rates')
export class ExchangeRate extends AbstractBaseEntity {
  @Column()
  base_currency: string;

  @Column()
  quote_currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  buy_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  sell_rate: number;

  @Column()
  source: 'admin' | 'api';
}
