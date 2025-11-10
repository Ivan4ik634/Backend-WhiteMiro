import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('/tasks')
  @UseGuards(AuthGuard)
  async getTasks(@CurrectUser() userId: string) {
    return this.scheduleService.getTasks(userId);
  }
}
