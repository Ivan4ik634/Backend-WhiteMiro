import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';
import { Board } from 'src/shemes/Board.scheme';
import { Message } from 'src/shemes/Message';
import { Settings } from 'src/shemes/Settings.scheme';
import { Task } from 'src/shemes/Task.scheme';
import { User } from 'src/shemes/User.scheme';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel('Board') private readonly boardModel: Model<Board>,
    @InjectModel('Task') private readonly taskModel: Model<Task>,
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectModel('Settings') private readonly settingsModel: Model<Settings>,
    @InjectModel('User') private readonly user: Model<User>,
    private readonly notification: NotificationService,
  ) {}
  async create(userId: string, createBoardDto: CreateBoardDto) {
    const createBoard = await this.boardModel.create({
      userId,
      ...createBoardDto,
      members: [userId],
    });
    const board = await this.boardModel
      .findById(createBoard._id)
      .populate<{ members: { _id: string }[] }>('members');
    return board;
  }

  async findAll(userId: string) {
    const boards = await this.boardModel
      .find({
        $or: [
          { userId }, // где он автор
          { members: { $in: [userId] } }, // или где он в списке участников
        ],
      })
      .populate('members');

    return boards;
  }

  async statistickBoard(userId: string) {
    const boards = await this.boardModel
      .find({
        $or: [
          { userId }, // где он автор
          { members: { $in: [userId] } }, // или где он участник
        ],
      })
      .populate('members');

    const boardIds = boards.map((b) => b._id);

    const tasks = await this.taskModel.find({
      boardId: { $in: boardIds },
    });

    const totalTasks = await this.taskModel.countDocuments({
      boardId: { $in: boardIds },
    });

    const teamBoards = boards.filter((b) => b.members.length > 1);
    const privateBoards = boards.filter((b) => b.access === 'locked');
    const doneBoards = boards.filter((b) => b.status === 'done');

    const avgMembers =
      boards.length > 0
        ? boards.reduce((acc, cur) => acc + cur.members.length, 0) /
          boards.length
        : 0;

    const lastBoards = boards
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    const lastTasks = tasks
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return {
      lastBoards,
      lastTasks,
      totalBoards: boards.length,
      totalTasks,
      teamBoards: teamBoards.length,
      privateBoards: privateBoards.length,
      avgMembers: Number(avgMembers.toFixed(1)), // округляем до 1 знака
      doneBoards: doneBoards.length,
    };
  }

  async findOne(userId: string, id: string) {
    const board = await this.boardModel
      .findOne({ _id: id })
      .populate<{ members: { _id: string }[] }>('members');

    if (!board) return { message: 'Board not found' };

    if (
      board.userId !== userId &&
      !board.members.some((el) => String(el._id) === userId)
    )
      return { message: 'Access denied' };

    const tasks = await this.taskModel.find({ boardId: board._id });
    const messages = await this.messageModel
      .find({ roomId: id })
      .populate('userId');
    return { board, tasks, messages };
  }

  async update(id: string, userId: string, updateBoardDto: UpdateBoardDto) {
    const board = await this.boardModel.findOne({ _id: id });
    if (!board) return { message: 'Board not found' };
    if (board.userId !== userId) return { message: 'Access denied' };

    await this.boardModel.updateOne({ _id: id }, { ...updateBoardDto });

    const boardUpdated = await this.boardModel
      .findOne({ _id: id })
      .populate<{ members: { _id: string }[] }>('members');

    return boardUpdated;
  }

  async invite(targetUserId: string, boardId: string) {
    const board = await this.boardModel.findOne({ _id: boardId });

    if (!board) return { message: 'Board not found' };

    const avtor = await this.user.findById(board.userId);
    const settings = await this.settingsModel.findOne({ userId: board.userId });
    if (!avtor || !settings) return { message: 'Board not found' };

    if (
      board.userId === targetUserId ||
      board.members.some((el) => String(el) === targetUserId)
    )
      return { message: 'You already is joing  board' };
    if (board.access === 'locked') return { message: 'Board is locked' };

    const targetUser = await this.user.findById(targetUserId);

    await this.boardModel.updateOne(
      { _id: boardId },
      { $push: { members: targetUserId } },
    );
    if (settings.notificationEnteringBoard) {
      await this.notification.sendPushNotification(
        avtor.playerIds,
        `A participant has been added to you!`,
        `A member named ${targetUser!.username} was added to the board ${board.title}.`,
        `/board/${boardId}`,
      );
    }
    return { message: 'User invited' };
  }

  async toggleLike(id: string, userId: string) {
    const board = await this.boardModel.findOne({ _id: id });
    if (!board) return { message: 'Board not found' };

    if (
      board.userId !== userId &&
      !board.members.some((el) => String(el._id) === userId)
    )
      return { message: 'Access denied' };

    const isLiked = board.liked.some((el) => String(el) === userId);
    const updateBoardDto = isLiked
      ? { $pull: { liked: userId } }
      : { $push: { liked: userId } };

    await this.boardModel.updateOne({ _id: id }, updateBoardDto);

    const boardUpdated = await this.boardModel
      .findOne({ _id: id })
      .populate<{ members: { _id: string }[] }>('members');

    return boardUpdated;
  }

  async remove(id: string, userId: string) {
    const board = await this.boardModel.findOne({ _id: id });
    if (!board) return { message: 'Board not found' };
    if (
      board.userId !== userId &&
      !board.members.some((el) => String(el._id) === userId)
    )
      return { message: 'Access denied' };

    if (board.userId === userId) {
      await this.boardModel.deleteOne({ _id: id });
      return { message: 'Board deleted' };
    }

    await this.boardModel.updateOne(
      { _id: id },
      { members: { $pull: { userId: userId } } },
    );

    return { message: 'Board leave' };
  }
}
