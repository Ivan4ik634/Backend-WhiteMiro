import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleTask } from 'src/shemes/ScheduleTask.scheme';
import { User } from 'src/shemes/User.scheme';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(User.name) private readonly user: Model<User>,
    @InjectModel(ScheduleTask.name) private readonly scheduleTask: Model<ScheduleTask>,
  ) {}
  async getTasks(userId: string) {
    const user = await this.user.findById(userId);
    if (!user) return null;
    return await this.scheduleTask.find({ userId: user._id });
  }
}
