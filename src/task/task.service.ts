import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from 'src/shemes/Task.scheme';
@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private readonly task: Model<Task>) {}

  async findAllTasks(userId: string) {
    const tasks = await this.task
      .find({ userId })
      .populate('boardId')
      .populate('userId');

    return tasks;
  }
  async findOne(id: string, userId: string) {
    const task = await this.task
      .findOne({ _id: id })
      .populate('boardId')
      .populate('userId')
      .populate('edges.from')
      .populate('edges.to');
    if (String(task?.userId) !== userId)
      return new ForbiddenException('Access denied');
    return task;
  }
}
