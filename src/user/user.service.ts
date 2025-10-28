import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from 'src/shemes/Board.scheme';
import { Settings } from 'src/shemes/Settings.scheme';
import { User } from 'src/shemes/User.scheme';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly user: Model<User>,
    @InjectModel(Board.name) private readonly board: Model<Board>,
    @InjectModel('Settings') private readonly settings: Model<Settings>,

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
    await this.settings.create({ userId: newUser._id });

    const token = await this.jwt.signAsync(
      { _id: newUser._id },
      { secret: 'secret', expiresIn: '30d' },
    );

    return { token, userId: newUser._id };
  }
  async login(dto: LoginDto) {
    const userUserName = await this.user.findOne({ username: dto.username });
    if (userUserName) {
      if (userUserName.password === dto.password) {
        const token = await this.jwt.signAsync(
          { _id: userUserName._id },
          { secret: 'secret', expiresIn: '30d' },
        );

        await this.user.updateOne(
          { _id: userUserName._id },
          { $push: { playerIds: dto.playerId } },
        );

        return { token, userId: userUserName._id };
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
}
