import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/register')
  async register(@Res() res, @Body() dto: RegisterDto) {
    const register = await this.userService.register(dto);
    if (register.message === 'A user with this name or email already exists') {
      return { message: register.message };
    } else {
      res.cookie('token', register.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return { isAuth: true };
    }
  }

  @Post('/login')
  async login(@Res() res, @Body() dto: LoginDto) {
    const login = await this.userService.login(dto);
    if (login.message === 'Incorrect login or password') {
      return { message: login.message };
    } else {
      res.cookie('token', login.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return { isAuth: true };
    }
  }

  @Get('/github/callback')
  async githubCallback(@Query('code') code: string, @Res() res) {
    const { token } = await this.userService.githubCallback(code);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`https://white-miro.vercel.app/`);
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  async profile(@CurrectUser() userId: string) {
    return this.userService.profile(userId);
  }
  @Get('/get-userId')
  @UseGuards(AuthGuard)
  async getUserId(@CurrectUser() userId: string) {
    return { userId };
  }

  @Get('/members')
  @UseGuards(AuthGuard)
  async findMembers(@CurrectUser() userId: string) {
    return this.userService.findMembers(userId);
  }

  @Post('/profile')
  @UseGuards(AuthGuard)
  async editProfile(@CurrectUser() userId: string, @Body() dto: editProfileDto) {
    return this.userService.editProfile(userId, dto);
  }
  @Get('/profile/:id')
  async UserProfile(@CurrectUser() userId: string, @Param() param: { id: string }) {
    return this.userService.profileUserName(param.id, userId);
  }
}
