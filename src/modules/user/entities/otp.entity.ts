import { AbstractBaseEntity } from "src/entities/base.entity";
import { Column, Entity, Index } from "typeorm";

@Entity('otps')
@Index(['email', 'expiresAt'])
export class Otp extends AbstractBaseEntity {
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  code: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiresAt: Date;

  @Column({ default: 0 })
  attempts: number;
}