import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from 'src/shemes/Board.scheme';
import { Comment, CommentSchema } from 'src/shemes/Comment.scheme';
import { Task, TaskSchema } from 'src/shemes/Task.scheme';
import { User, UserSchema } from 'src/shemes/User.scheme';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [CommentController],
  providers: [CommentService, JwtService],
})
export class CommentModule {}
