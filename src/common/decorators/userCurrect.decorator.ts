import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';

export const CurrectUser = createParamDecorator(
  (data: UserDto, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user._id;
  },
);
