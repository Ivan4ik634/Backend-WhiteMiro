import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';

export const CurrectUser = createParamDecorator((data: UserDto, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  console.log(request.cookies, request.signedCookies);
  console.log(`User ${request.user}`);
  return request.user._id;
});
