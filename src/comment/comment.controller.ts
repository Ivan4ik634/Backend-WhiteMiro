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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  findAll(@CurrectUser() userId: string, @Param('id') id: string) {
    return this.commentService.findAll(userId, id);
  }
  @Post('')
  @UseGuards(AuthGuard)
  create(@CurrectUser() userId: string, @Body() body: CreateCommentDto) {
    return this.commentService.create(userId, body);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  delete(@CurrectUser() userId: string, @Param('id') id: string) {
    return this.commentService.delete(userId, id);
  }
  @Patch()
  @UseGuards(AuthGuard)
  update(@CurrectUser() userId: string, @Body() body: UpdateCommentDto) {
    return this.commentService.update(userId, body);
  }
}
