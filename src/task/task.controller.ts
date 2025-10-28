import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findTasks(@CurrectUser() userId: string) {
    return this.taskService.findAllTasks(userId);
  }
}
