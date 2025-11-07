import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from 'src/shemes/Activity.scheme';
import { User } from 'src/shemes/User.scheme';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel('Activity') private readonly activity: Model<Activity>,
    @InjectModel('User') private readonly user: Model<User>,
  ) {}

  async findAll(userId: string, page: number) {
    const limit = 10;
    const user = await this.user.findById(userId);
    if (!user) return 'User not found';
    const activities = await this.activity
      .find({ members: { $in: [userId] } })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return activities;
  }
}
