import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { NotificationService } from 'src/notification/notification.service';
import { Activity } from 'src/shemes/Activity.scheme';
import { Board } from 'src/shemes/Board.scheme';
import { Message } from 'src/shemes/Message';
import { Settings } from 'src/shemes/Settings.scheme';
import { Task } from 'src/shemes/Task.scheme';
import { User } from 'src/shemes/User.scheme';
import { CreateTaskDto } from './dto/createDto';
import { UpdateTaskDto, UpdateTaskIsDoneDto } from './dto/updateDto';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class TaskGateway {
  @WebSocketServer() server: Server;

  constructor(
    @InjectModel('User') private readonly user: Model<User>,
    @InjectModel('Message') private readonly message: Model<Message>,
    @InjectModel('Task') private readonly taskModel: Model<Task>,
    @InjectModel('Activity') private readonly activityModel: Model<Activity>,
    @InjectModel('Board') private readonly boardModel: Model<Board>,
    @InjectModel('Settings') private readonly settingsModel: Model<Settings>,
    private readonly notification: NotificationService,
    private readonly jwt: JwtService,
  ) {}

  // ✅ АВТО-АВТОРИЗАЦИЯ ПО JWT
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.disconnect(true);
      return;
    }
    console.log(token);
    try {
      const payload = this.jwt.verify(token, { secret: 'secret' }) as any;
      console.log(payload);
      const userId = payload._id;

      if (!userId) {
        client.disconnect(true);
        return;
      }

      client.data.userId = userId;
      client.join(userId);
      await this.user.updateOne({ _id: userId }, { online: true });

      console.log(`✅ User ${userId} connected`);
    } catch (err) {
      console.error('❌ Invalid token:', err.message);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.user.updateOne({ _id: userId }, { online: false });
    client.leave(userId);
    console.log(`❌ User ${userId} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  async switchRoom(client: Socket, roomId: string) {
    const userId = client.data.userId;

    const rooms = Array.from(client.rooms).filter((r) => r !== client.id && r !== userId);
    for (const room of rooms) client.leave(room);

    client.join(roomId);
    console.log(`Client ${client.id} switched to room ${roomId}`);
  }

  @SubscribeMessage('task:create')
  async create(client: Socket, payload: CreateTaskDto) {
    const userId = client.data.userId;

    const board = await this.boardModel.findOne({ _id: payload.boardId }).populate<{ playerIds: string[] }>('members');
    if (!board) return { message: 'Board not found' };

    const members = board.members.filter((member) => String(member._id) !== userId);
    const avtorTask = await this.user.findById(userId);
    if (!avtorTask) return { message: 'Avtor task not found' };

    await Promise.all(
      members.map(async (obj) => {
        const settings = await this.settingsModel.findOne({ userId: obj._id });
        if (!settings) return;
        if (settings.notificationMessages) {
          this.notification.sendPushNotification(
            //@ts-ignore
            obj.playerIds,
            `A new task has been created!`,
            `A new task has been created on the board ${board.title} by the user ${avtorTask.username}.`,
            `/board/${board._id}`,
          );
        }
      }),
    );

    const newTask = await this.taskModel.create({
      ...payload,
      boardId: board._id,
      userId,
    });
    await this.boardModel.updateOne({ _id: board._id }, { $inc: { tasks: 1 } });
    await this.activityModel.create({
      boardId: board._id,
      members: board.members.map((obj) => String(obj._id)),
      type: 'create',
      text: `A new task has been created on the board ${board.title} by the user ${avtorTask.username}.`,
      title: 'Task created',
    });
    const task = await this.taskModel.findById(newTask._id).populate('userId');
    this.server.to(payload.roomId).emit('task:created', task);
    return task;
  }

  @SubscribeMessage('task:update:isDone')
  async updateIsDone(client: Socket, payload: UpdateTaskIsDoneDto) {
    const userId = client.data.userId;

    const task = await this.taskModel.findById(payload._id);
    if (!task) return { message: 'Task not found' };

    const board = await this.boardModel.findById(task.boardId);
    if (!board) return { message: 'Board not found' };

    const hasAccess = String(board.userId) === userId || board.members.some((el) => String(el) === userId);
    if (!hasAccess) return { message: 'Access denied' };

    await this.taskModel.updateOne({ _id: payload._id }, { $set: { isDone: payload.isDone } });

    const taskUpdated = await this.taskModel.findById(payload._id);
    this.server.to(payload.roomId).emit('task:updated:isDone', {
      userId,
      task: taskUpdated,
    });
  }

  @SubscribeMessage('task:update')
  async update(client: Socket, payload: UpdateTaskDto) {
    console.log('update task payload', payload);
    const userId = client.data.userId;

    const user = await this.user.findById(userId);
    if (!user) {
      console.log('user not found');
      return { message: 'User not found' };
    }

    const task = await this.taskModel.findById(payload._id);
    if (!task) {
      console.log('task not found');
      return { message: 'Task not found' };
    }

    const board = await this.boardModel.findById(task.boardId);
    if (!board) {
      console.log('board not found');
      return { message: 'Board not found' };
    }

    const hasAccess = String(board.userId) === userId || board.members.some((el) => String(el) === userId);
    if (!hasAccess) {
      console.log('access denied');
      return { message: 'Access denied' };
    }

    const updateQuery: any = { $set: { ...payload, boardId: board._id } };

    if (payload.edge) {
      const from = await this.taskModel.findById(payload.edge.from);
      const to = await this.taskModel.findById(payload.edge.to);
      if (from && to) updateQuery.$push = { edges: { from: from._id, to: to._id } };
    }
    console.log('update query', updateQuery);
    await this.taskModel.updateOne({ _id: payload._id }, updateQuery);
    if (Number(task.x) === Number(payload.x) && Number(task.y) === Number(payload.y)) {
      await this.activityModel.create({
        boardId: board._id,
        members: board.members,
        type: 'edit',
        text: `The task was edited on board ${board.title} by user ${user.username}.`,
        title: 'Task updated',
      });
    }

    const taskUpdated = await this.taskModel.findById(payload._id).populate('userId');
    console.log('task updated', taskUpdated);
    this.server.to(payload.roomId).emit('task:updated', { userId, task: taskUpdated });
    return taskUpdated;
  }

  @SubscribeMessage('task:delete')
  async delete(client: Socket, payload: { roomId: string; _id: string }) {
    const userId = client.data.userId;

    const user = await this.user.findById(userId);
    if (!user) return { message: 'User not found' };

    const task = await this.taskModel.findById(payload._id);
    if (!task) return { message: 'Task not found' };

    const board = await this.boardModel.findById(task.boardId);
    if (!board) return { message: 'Board not found' };

    if (String(board.userId) !== userId && !board.members.some((el) => String(el._id) === userId))
      return { message: 'Access denied' };

    await this.taskModel.deleteOne({ _id: payload._id });
    await this.taskModel.updateMany(
      {
        $or: [{ 'edges.from': String(task._id) }, { 'edges.to': String(task._id) }],
      },
      {
        $pull: {
          edges: {
            $or: [{ from: String(task._id) }, { to: String(task._id) }],
          },
        },
      },
    );
    await this.activityModel.create({
      boardId: board._id,
      members: board.members,
      type: 'delete',
      text: `The task was deleted on board ${board.title} by user ${user.username}.`,
      title: 'Task deleted',
    });
    this.server.to(payload.roomId).emit('task:deleted', { _id: payload._id });
    return { message: 'Task deleted' };
  }

  @SubscribeMessage('userOnline')
  async userOnline(client: Socket) {
    const userId = client.data.userId;

    const user = await this.user.findById(userId);
    if (!user) return;

    await this.user.updateOne({ _id: userId }, { online: true });

    const onlineUsers = await this.user.find({ online: true });
    this.server.emit('onlineUsers', { users: onlineUsers });
  }

  @SubscribeMessage('moveUser')
  async moveUser(client: Socket, payload: { roomId: string; x: number; y: number }) {
    const userId = client.data.userId;
    const user = await this.user.findById(userId);
    if (!user) return;

    this.server.to(payload.roomId).emit('userMoved', { user, ...payload });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: { roomId: string; text: string }) {
    const userId = client.data.userId;
    const user = await this.user.findById(userId);
    if (!user) return;

    const newMessage = await this.message.create({
      roomId: payload.roomId,
      text: payload.text,
      userId,
    });

    const board = await this.boardModel.findById(payload.roomId);
    if (!board) return;

    const members = board.members.filter((member) => String(member._id) !== userId);

    await Promise.all(
      members.map(async (obj) => {
        const settings = await this.settingsModel.findOne({ userId: obj._id });
        if (settings?.notificationMessages) {
          await this.notification.sendPushNotification(
            //@ts-ignore
            obj.playerIds,
            `A new message has been created!`,
            `A new message on board ${board.title} by ${user.username}.`,
            `/board/${board._id}`,
          );
        }
      }),
    );

    const message = await this.message.findById(newMessage._id).populate('userId');
    this.server.to(payload.roomId).emit('receiveMessage', { message });
  }
}
