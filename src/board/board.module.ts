import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { BoardSchema } from 'src/shemes/Board.scheme';
import { MessageSchema } from 'src/shemes/Message';
import { SettingsSchema } from 'src/shemes/Settings.scheme';
import { TaskSchema } from 'src/shemes/Task.scheme';
import { UserSchema } from 'src/shemes/User.scheme';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Board', schema: BoardSchema }]),
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    NotificationModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, JwtService],
})
export class BoardModule {}
