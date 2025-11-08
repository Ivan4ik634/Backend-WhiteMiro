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

 async findAll(userId: string, cursor?: string | null) {
  const limit = 10;

  const filter: any = { members: { $in: [userId] } };

  // ВАЖНО: проверяем, что курсор — валидный ObjectId
  if (cursor && cursor !== 'null') {
    filter._id = { $lt: cursor };
  }

  const results = await this.activity
    .find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, -1) : results;

  const nextCursor = hasMore ? items[items.length - 1]._id : null;

  return {
    items,
    nextCursor,
  };
}

}
