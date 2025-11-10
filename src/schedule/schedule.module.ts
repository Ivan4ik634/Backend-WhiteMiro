import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleTask, ScheduleTaskSchema } from 'src/shemes/ScheduleTask.scheme';
import { User, UserSchema } from 'src/shemes/User.scheme';
import { ScheduleController } from './schedule.controller';
import { ScheduleCron } from './schedule.cron';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: ScheduleTask.name, schema: ScheduleTaskSchema }]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, JwtService, ScheduleCron],
})
export class SchedulesModule {}
