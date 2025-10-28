import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from 'src/shemes/Board.scheme';
import { SettingsSchema } from 'src/shemes/Settings.scheme';
import { User, UserSchema } from 'src/shemes/User.scheme';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule {}
