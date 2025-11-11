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
    return this.userService.register(dto, res);
  }

  @Post('/login')
  async login(@Res() res, @Body() dto: LoginDto) {
    return this.userService.login(dto, res);
  }

  @Get('/github/callback')
  async githubCallback(@Query('code') code: string, @Res() res) {
    return this.userService.githubCallback(code, res);
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
