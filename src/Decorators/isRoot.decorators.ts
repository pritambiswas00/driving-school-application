import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const IsRoot = createParamDecorator((data:never, context: ExecutionContext) => {
   const request = context.switchToHttp().getRequest();
   return request.superadmin;
})