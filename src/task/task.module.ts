import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { ActivitySchema } from 'src/shemes/Activity.scheme';
import { BoardSchema } from 'src/shemes/Board.scheme';
import { MessageSchema } from 'src/shemes/Message';
import { ScheduleTask, ScheduleTaskSchema } from 'src/shemes/ScheduleTask.scheme';
import { SettingsSchema } from 'src/shemes/Settings.scheme';
import { TaskSchema } from 'src/shemes/Task.scheme';
import { UserSchema } from 'src/shemes/User.scheme';
import { TaskController } from './task.controller';
import { TaskGateway } from './task.gateway';
import { TaskService } from './task.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: 'Board', schema: BoardSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    MongooseModule.forFeature([{ name: 'Activity', schema: ActivitySchema }]),
    MongooseModule.forFeature([{ name: ScheduleTask.name, schema: ScheduleTaskSchema }]),

    NotificationModule,
  ],
  providers: [TaskGateway, JwtService, TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
