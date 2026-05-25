import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export type CurrentUser = { userId: string };
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUser => {
  const req = ctx.switchToHttp().getRequest<{ user?: CurrentUser }>();
  return req.user!;
});
