import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { ScheduleTask } from 'src/shemes/ScheduleTask.scheme';
import { User } from 'src/shemes/User.scheme';

@Injectable()
export class ScheduleCron {
  constructor(
    @InjectModel(User.name) private readonly user: Model<User>,
    @InjectModel(ScheduleTask.name) private readonly scheduleTask: Model<ScheduleTask>,
  ) {}
  @Cron('0 0 * * * *')
  async handleAddTaskScheduleEveryDay() {
    const today = dayjs().format('YYYY-MM-DD');
    const users = await this.user.find();
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await this.scheduleTask.create({
        userId: String(user._id),
        createdAt: today,
      });
    }
  }
}
