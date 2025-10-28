import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdateSettingsDto } from './dto/update.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('/update')
  @UseGuards(AuthGuard)
  async settingsUpdate(
    @CurrectUser() userId: string,
    @Body() body: UpdateSettingsDto,
  ) {
    return this.settingsService.settingsUpdate(userId, body);
  }
}
