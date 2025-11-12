import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from 'src/shemes/Board.scheme';
import { ScheduleTask, ScheduleTaskSchema } from 'src/shemes/ScheduleTask.scheme';
import { SettingsSchema } from 'src/shemes/Settings.scheme';
import { User, UserSchema } from 'src/shemes/User.scheme';
import { GoogleStrategy } from './google.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    MongooseModule.forFeature([{ name: ScheduleTask.name, schema: ScheduleTaskSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, GoogleStrategy, JwtService],
})
export class UserModule {}
