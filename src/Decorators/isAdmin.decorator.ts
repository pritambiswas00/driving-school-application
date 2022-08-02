import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const IsAdmin = createParamDecorator((data:never, context: ExecutionContext) => {
   const request = context.switchToHttp().getRequest();
   return request.admin;
}) 