import { PartialType } from '@nestjs/swagger';
import { WalletDto } from './wallet.dto';

export class UpdateWalletDto extends PartialType(WalletDto) {}
