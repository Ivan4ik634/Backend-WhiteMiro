import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrectUser() userId: string,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardService.create(userId, createBoardDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrectUser() userId: string) {
    return this.boardService.findAll(userId);
  }

  @Get('/statistick')
  @UseGuards(AuthGuard)
  statistick(@CurrectUser() userId: string) {
    return this.boardService.statistickBoard(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@CurrectUser() userId: string, @Param('id') id: string) {
    return this.boardService.findOne(userId, id);
  }

  @Post('/like/:id')
  @UseGuards(AuthGuard)
  toggleLike(@CurrectUser() userId: string, @Param('id') id: string) {
    return this.boardService.toggleLike(userId, id);
  }

  @Post('/invite/:id')
  @UseGuards(AuthGuard)
  boardInviteUser(@CurrectUser() userId: string, @Param('id') id: string) {
    return this.boardService.invite(userId, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrectUser() userId: string,
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, userId, updateBoardDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrectUser() userId: string, @Param('id') id: string) {
    return this.boardService.remove(id, userId);
  }
}
