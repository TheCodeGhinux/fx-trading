import { PartialType } from '@nestjs/swagger';
import { WalletDto } from './create-wallet.dto';

export class UpdateWalletDto extends PartialType(WalletDto) {}
