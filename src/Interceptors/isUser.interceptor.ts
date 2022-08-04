import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/Services/user.service";


@Injectable()
export class IsUserInterceptor implements NestInterceptor{

    constructor(private readonly userService:UserService, private readonly jwtService:JwtService){}

    async intercept(context: ExecutionContext, next: CallHandler<any>){
        const request = context.switchToHttp().getRequest();
        let token:string = request.header("Authorization");
        if(token) {
           token = token.replace("Bearer ", "");
           const verification:any = this.jwtService.decode(token);
           const user = await this.userService.findUserById(verification.userId);
           request.user = {...user, userid: verification.userId}
        }
        return next.handle();
    }

}