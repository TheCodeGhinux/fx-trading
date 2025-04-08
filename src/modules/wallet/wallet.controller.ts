import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateWalletDto, FundWalletDto, TransferFundsDto } from './dto/wallet.dto';
import PaginationValidator from 'src/common/pagination.validator';
import { Currency } from './entities/wallet.entity';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @HttpCode(200)
  @Post('')
  create(@CurrentUser() user: User, @Body() payload: CreateWalletDto) {
    return this.walletService.createUserWallet(user, payload);
  }

  @HttpCode(200)
  @Post('fund')
  fundWallet(@CurrentUser() user: User, @Body() payload: FundWalletDto) {
    return this.walletService.fundWallet(user, payload);
  }

  @HttpCode(200)
  @Post('transfer')
  transferFunds(@CurrentUser() user: User, @Body() payload: TransferFundsDto) {
    return this.walletService.transferFunds(user, payload);
  }

  @Get('/:currencyType')
  getWalletByCurrencyType(@CurrentUser() user: User, @Param('currencyType') currencyType: string ) {
    currencyType = currencyType.toUpperCase()
    return this.walletService.getWalletByCurrencyType(user, currencyType);
  }

  @Get()
  getWallets(@CurrentUser() user: User, @Param() paginationParam?: PaginationValidator) {

    const paginationPayload = {
      page: paginationParam?.page ? +paginationParam.page : 1,
      limit: paginationParam?.limit ? +paginationParam.limit : 10,
    };
    const filterRecordOptions: Record<string, unknown> = {};

    filterRecordOptions.user_id = user.id;

    return this.walletService.getWallets({
      paginationPayload,
      filterRecordOptions,
    });
  }
}
