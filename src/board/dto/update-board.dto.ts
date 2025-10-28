import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  access: 'locked' | 'public';
  status: 'in planning' | 'action' | 'done' | 'archived';
}
