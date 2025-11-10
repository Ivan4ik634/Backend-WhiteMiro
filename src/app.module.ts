import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ActivityModule } from './activity/activity.module';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';
import { SchedulesModule } from './schedule/schedule.module';
import { SettingsModule } from './settings/settings.module';
import { TaskModule } from './task/task.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://admin:wwwwww@db.kyyjtdj.mongodb.net/?retryWrites=true&w=majority&appName=DB'),
    ScheduleModule.forRoot(),
    PaymentModule,
    UserModule,
    UploadModule,
    TaskModule,
    BoardModule,
    NotificationModule,
    SettingsModule,
    CommentModule,
    ActivityModule,
    SchedulesModule,
  ],
})
export class AppModule {}
