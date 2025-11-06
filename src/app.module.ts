import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';
import { CommentModule } from './comment/comment.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:wwwwww@db.kyyjtdj.mongodb.net/?retryWrites=true&w=majority&appName=DB',
    ),
    UserModule,
    UploadModule,
    TaskModule,
    BoardModule,
    NotificationModule,
    SettingsModule,
    CommentModule,
    ActivityModule,
  ],
})
export class AppModule {}
