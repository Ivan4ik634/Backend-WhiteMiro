import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { Board } from 'src/shemes/Board.scheme';
import { ScheduleTask } from 'src/shemes/ScheduleTask.scheme';
import { Settings } from 'src/shemes/Settings.scheme';
import { User } from 'src/shemes/User.scheme';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly user: Model<User>,
    @InjectModel(Board.name) private readonly board: Model<Board>,
    @InjectModel('Settings') private readonly settings: Model<Settings>,
    @InjectModel(ScheduleTask.name) private readonly scheduleTask: Model<ScheduleTask>,

    private readonly jwt: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const user = await this.user.findOne({
      username: dto.username,
    });
    const userEmail = await this.user.findOne({
      email: dto.email,
    });
    if (user || userEmail)
      return {
        message: 'A user with this name or email already exists',
      };

    const newUser = await this.user.create({ ...dto });
    const today = dayjs().format('YYYY-MM-DD');
    await this.settings.create({ userId: newUser._id });
    await this.scheduleTask.create({ userId: String(newUser._id), createdAt: today });

    const token = await this.jwt.signAsync({ _id: newUser._id }, { secret: 'secret', expiresIn: '30d' });

    return { token };
  }

  async login(dto: LoginDto) {
    const userUserName = await this.user.findOne({ username: dto.username });
    if (userUserName) {
      if (userUserName.password === dto.password) {
        const token = await this.jwt.signAsync({ _id: userUserName._id }, { secret: 'secret', expiresIn: '30d' });

        await this.user.updateOne({ _id: userUserName._id }, { $push: { playerIds: dto.playerId } });

        return { token };
      }
    }

    return { message: 'Incorrect login or password' };
  }

  async editProfile(userId: string, dto: editProfileDto) {
    const userUserName = await this.user.findOne({ username: dto.username });
    const userEmail = await this.user.findOne({ email: dto.email });
    if (userUserName && userEmail) return { message: 'Login not found' };
    const user = await this.user.findById(userId);
    if (!user) return { message: 'User not found' };
    const data = {
      ...dto,
      email: dto.email === '' ? user.email : dto.email,
      username: dto.username === '' ? user.username : dto.username,
    };
    const userUpdate = await this.user.findByIdAndUpdate(userId, {
      ...data,
    });

    return { userUpdate };
  }

  async profile(userId: string) {
    const profile = await this.user.findById(userId);
    return profile;
  }

  async findMembers(userId: string) {
    const boards = await this.board.find({ userId }).populate('members');

    console.log(boards.map((el) => el.members));

    return boards.map((el) => el.members);
  }
  async profileUserName(id: string, userId: string) {
    const profile = await this.user.findById(id);
    if (!profile) return 'User not defined';

    const boards = await this.board.find({ members: { $in: [userId, id] } });

    return { profile, boards };
  }
  async githubCallback(code: string) {
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } },
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. Получаем данные юзера
    const userResponse = await axios.get(`https://api.github.com/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const emailResponse = await axios.get(`https://api.github.com/user/emails`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubUser = {
      id: userResponse.data.id,
      username: userResponse.data.login,
      avatar: userResponse.data.avatar_url,
      email: emailResponse.data.find((e) => e.primary)?.email ?? null,
    };

    const user = await this.user.findOne({ username: githubUser.username, email: githubUser.email });

    if (user) {
      const token = await this.jwt.signAsync({ _id: user._id }, { secret: 'secret', expiresIn: '30d' });

      return { token };
    } else {
      const newUser = await this.user.create({ ...githubUser });
      const token = await this.jwt.signAsync({ _id: newUser._id }, { secret: 'secret', expiresIn: '30d' });

      return { token };
    }
  }
}
