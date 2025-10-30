import { InjectModel } from '@nestjs/mongoose';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { NotificationService } from 'src/notification/notification.service';
import { Board } from 'src/shemes/Board.scheme';
import { Message } from 'src/shemes/Message';
import { Settings } from 'src/shemes/Settings.scheme';
import { Task } from 'src/shemes/Task.scheme';
import { User } from 'src/shemes/User.scheme';
import { CreateTaskDto } from './dto/createDto';
import { UpdateTaskDto } from './dto/updateDto';

@WebSocketGateway({
  origin: '*',
})
export class TaskGateway {
  @WebSocketServer() server: Server;

  constructor(
    @InjectModel('User') private readonly user: Model<User>,
    @InjectModel('Message') private readonly message: Model<Message>,
    @InjectModel('Task') private readonly taskModel: Model<Task>,
    @InjectModel('Board') private readonly boardModel: Model<Board>,
    @InjectModel('Settings') private readonly settingsModel: Model<Settings>,
    private readonly notification: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (typeof userId === 'string') client.join(userId!);

    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    const user = await this.user.findOne({ _id: userId });
    console.log(userId, user);
    if (!user) return;

    if (typeof userId === 'string') {
      await this.user.updateOne({ _id: user._id }, { online: false });

      client.leave(userId!);
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async switchRoom(client: Socket, roomId: string) {
    // Получаем все комнаты, кроме собственной (client.id) и комнаты userId
    const userId = client.handshake.auth.userId;
    const rooms = Array.from(client.rooms).filter(
      (r) => r !== client.id && r !== userId,
    );

    // Ливаем только из чатов, но не из комнаты userId!
    for (const room of rooms) {
      client.leave(room);
    }

    // Присоединяемся к комнате чата
    client.join(roomId);

    console.log(`Client ${client.id} switched to room ${roomId}`);
  }

  @SubscribeMessage('task:create')
  async create(client: Socket, payload: CreateTaskDto) {
    const board = await this.boardModel
      .findOne({ _id: payload.boardId })
      .populate<{ playerIds: string[] }>('members');
    if (!board) return { message: 'Board not found' };

    const members = board.members.filter(
      (member) => String(member._id) !== payload.userId,
    );
    const avtorTask = await this.user.findOne({ _id: payload.userId });
    if (!avtorTask) return { message: 'Avtor task not found' };

    await Promise.all(
      members.map(async (obj) => {
        const settings = await this.settingsModel.findOne({ userId: obj._id });
        if (!settings) return;
        if (settings.notificationMessages) {
          members.map((obj) => {
            this.notification.sendPushNotification(
              //@ts-ignore
              obj.playerIds,
              `A new task has been created!`,
              `A new task has been created on the board ${board.title} by the user ${avtorTask!.username}.`,
              `/board/${board._id}`,
            );
          });
        }
      }),
    );

    const newTask = await this.taskModel.create({
      ...payload,
      boardId: board._id,
    });
    await this.boardModel.updateOne({ _id: board._id }, { $inc: { tasks: 1 } });

    const task = await this.taskModel.findById(newTask._id);

    this.server.to(payload.roomId).emit('task:created', task);
  }

  @SubscribeMessage('task:update')
  async update(client: Socket, payload: UpdateTaskDto) {
    const task = await this.taskModel.findOne({ _id: payload._id });
    if (!task) return { message: 'Task not found' };

    const board = await this.boardModel.findOne({ _id: task.boardId });
    if (!board) return { message: 'Board not found' };

    const hasAccess =
      String(board.userId) === payload.userId ||
      board.members.some((el) => String(el) === payload.userId);

    if (!hasAccess) return { message: 'Access denied' };

    // Формируем апдейт корректно
    const updateQuery: any = {
      $set: { ...payload, boardId: board._id },
    };

    // Если есть edges — пушим отдельно
    if (payload.edge) {
      updateQuery.$push = { edges: payload.edge };
    }

    // Обновляем задачу
    await this.taskModel.updateOne({ _id: payload._id }, updateQuery);

    // Проверяем изменение статуса задачи
    if (payload.isDone !== task.isDone) {
      const incValue = payload.isDone ? 1 : -1;
      await this.boardModel.updateOne(
        { _id: board._id },
        { $inc: { tasksDone: incValue } },
      );
    }

    // Получаем обновлённую задачу
    const taskUpdated = await this.taskModel.findById(payload._id);

    // Отправляем событие всем участникам комнаты
    this.server
      .to(payload.roomId)
      .emit('task:updated', { userId: payload.userId, task: taskUpdated });

    return { success: true };
  }

  @SubscribeMessage('task:delete')
  async delete(
    client: Socket,
    payload: { roomId: string; userId: string; _id: string },
  ) {
    const task = await this.taskModel.findOne({ _id: payload._id });
    if (!task) return { message: 'Task not found' };
    const board = await this.boardModel.findOne({ _id: task.boardId });
    if (!board) return { message: 'Board not found' };

    if (
      board.userId !== payload.userId &&
      !board.members.some((el) => String(el._id) === payload.userId)
    )
      return { message: 'Access denied' };

    await this.taskModel.deleteOne({ _id: payload._id });
    await this.taskModel.updateMany(
      {
        $or: [
          { 'edges.from': String(task._id) },
          { 'edges.to': String(task._id) },
        ],
      },
      {
        $pull: {
          edges: {
            $or: [{ from: String(task._id) }, { to: String(task._id) }],
          },
        },
      },
    );
    await this.boardModel.updateOne(
      { _id: board._id },
      { $inc: { tasks: -1 } },
    );

    this.server.to(payload.roomId).emit('task:deleted', { _id: payload._id });
  }

  @SubscribeMessage('userOnline')
  async userOnline(client: Socket, payload: { userId: string }) {
    const { userId } = payload;

    const user = await this.user.findById(userId);
    if (!user) return null;

    await this.user.updateOne({ _id: userId }, { online: true });

    const onlineUsers = await this.user.find({ online: true });
    if (!onlineUsers) return null;

    this.server.emit('onlineUsers', { users: onlineUsers });
  }
  @SubscribeMessage('moveUser')
  async moveUser(
    client: Socket,
    payload: { roomId: string; x: number; y: number; userId: string },
  ) {
    const { roomId, x, y, userId } = payload;

    const user = await this.user.findById(userId);
    if (!user) return null;

    this.server.to(roomId).emit('userMoved', { x, y, user, roomId });
  }
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: {
      roomId: string;
      userId: string;
      text: string;
    },
  ) {
    const user = await this.user.findById(payload.userId);
    if (!user) return;

    const newMessage = await this.message.create({
      roomId: payload.roomId,
      text: payload.text,
      userId: user._id,
    });

    const board = await this.boardModel.findOne({ _id: payload.roomId });
    const avtorMessage = await this.user.findOne({ _id: user._id });
    if (!board) return;

    const members = board.members.filter(
      (member) => String(member._id) !== payload.userId,
    );

    await Promise.all(
      members.map(async (obj) => {
        const settings = await this.settingsModel.findOne({ userId: obj._id });
        if (!settings) return;
        if (settings.notificationMessages) {
          await this.notification.sendPushNotification(
            //@ts-ignore
            obj.playerIds,
            `A new message has been created!`,
            `A new message has been created on the board ${board.title} by the user ${avtorMessage!.username}.`,
            `/board/${board._id}`,
          );
        }
      }),
    );

    const message = await this.message
      .findById(newMessage._id)
      .populate('userId');

    this.server.to(payload.roomId).emit('receiveMessage', {
      message,
    });
  }
}
