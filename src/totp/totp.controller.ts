import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TotpService } from './totp.service';

@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Post('/generate')
  @UseGuards(AuthGuard)
  async generageTotp(@CurrectUser() userId: string) {
    return this.totpService.generate(userId);
  }
  @Post('/verify')
  @UseGuards(AuthGuard)
  async verifyTotp(@CurrectUser() userId: string, @Body('token') token: string) {
    return this.totpService.verify(userId, token);
  }
  @Post('/cancel')
  @UseGuards(AuthGuard)
  async cancle(@CurrectUser() userId: string) {
    return this.totpService.cancel(userId);
  }
}
