import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrectUser() userId: string, @Query('page') page: string) {
    return this.activityService.findAll(userId, Number(page));
  }
}
