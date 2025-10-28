import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from 'src/shemes/Task.scheme';
@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private readonly task: Model<Task>) {}

  async findAllTasks(userId: string) {
    const tasks = await this.task.find({ userId }).populate('boardId').populate('userId');

    return tasks;
  }
}
