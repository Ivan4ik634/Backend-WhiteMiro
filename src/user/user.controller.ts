import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import * as GoggleGuard from '@nestjs/passport';
import { Response } from 'express';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { editProfileDto, LoginDto, RegisterDto } from './dto/user';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/register')
  async register(@Res({ passthrough: true }) res: Response, @Body() dto: RegisterDto) {
    const register = await this.userService.register(dto);
    console.log(register);
    if (register.message === 'A user with this name or email already exists') {
      return { message: register.message };
    } else {
      res.cookie('token', register.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      return res.redirect(`${process.env.FRONTEND_URL}/u?isAuth=true`);
    }
  }

  @Post('/login')
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginDto) {
    const login = await this.userService.login(dto);
    console.log(login);
    if (login.message === 'Incorrect login or password') {
      return { message: login.message };
    } else {
      res.cookie('token', login.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      return res.redirect(`${process.env.FRONTEND_URL}/u?isAuth=true`);
    }
  }

  @Get('/github/callback')
  async githubCallback(@Query('code') code: string, @Res({ passthrough: true }) res: Response) {
    const { token } = await this.userService.githubCallback(code);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return res.redirect(`${process.env.FRONTEND_URL}/u?isAuth=true`);
  }

  @Get('/google')
  @UseGuards(GoggleGuard.AuthGuard('google'))
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(GoggleGuard.AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user as any;

    const { token } = await this.userService.googleAuthRedirect(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.redirect(`${process.env.FRONTEND_URL}/u?isAuth=true`);
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
