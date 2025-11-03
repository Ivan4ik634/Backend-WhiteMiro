import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from 'src/shemes/Board.scheme';
import { Comment } from 'src/shemes/Comment.scheme';
import { Task } from 'src/shemes/Task.scheme';
import { User } from 'src/shemes/User.scheme';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly comment: Model<Comment>,
    @InjectModel('Task') private readonly taskModel: Model<Task>,
    @InjectModel('User') private readonly user: Model<User>,
    @InjectModel('Board') private readonly boardModel: Model<Board>,
  ) {}
  async findAll(userId: string, id: string) {
    const task = await this.taskModel.findOne({ _id: id });
    if (!task) return { message: 'Task not found' };

    const board = await this.boardModel
      .findOne({ _id: task.boardId })
      .populate<{ members: { _id: string }[] }>('members');
    if (!board) return { message: 'Board not found' };
    if (
      board.userId !== userId &&
      !board.members.some((el) => String(el._id) === userId)
    )
      return { message: 'Access denied' };

    const comments = await this.comment.find({ taskId: id }).populate('userId');
    return comments;
  }
  async create(userId: string, data: CreateCommentDto) {
    const task = await this.taskModel.findOne({ _id: data.taskId });
    if (!task) return { message: 'Task not found' };

    const board = await this.boardModel
      .findOne({ _id: task.boardId })
      .populate<{ members: { _id: string }[] }>('members');

    if (!board) return { message: 'Board not found' };
    if (
      board.userId !== userId &&
      !board.members.some((el) => String(el._id) === userId)
    )
      return { message: 'Access denied' };

    const user = await this.user.findOne({ _id: userId });
    if (!user) return { message: 'User not found' };

    const newComment = await this.comment.create({ ...data, userId: user._id });
    return newComment;
  }
  async delete(userId: string, id: string) {
    const comment = await this.comment.findOne({ _id: id });
    if (!comment) return { message: 'Comment not found' };
    if (String(comment.userId) !== userId) return { message: 'Access denied' };

    await this.comment.deleteOne({ _id: comment._id });
    return { message: 'Delete comment' };
  }
  async update(userId: string, data: UpdateCommentDto) {
    const comment = await this.comment.findOne({ _id: data.commentId });
    if (!comment) return { message: 'Comment not found' };
    if (String(comment.userId) !== userId) return { message: 'Access denied' };

    await this.comment.updateOne({ _id: comment._id }, { text: data.text });

    const updatedComment = await this.comment.findOne({ _id: comment._id });
    return updatedComment!;
  }
}
