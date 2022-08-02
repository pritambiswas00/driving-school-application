import { NestInterceptor, ExecutionContext, CallHandler, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class IsRootInterceptor implements NestInterceptor{

    constructor(private readonly configService:ConfigService, private readonly jwtService: JwtService){}

    async intercept(context: ExecutionContext, next: CallHandler<any>){
        const request = context.switchToHttp().getRequest();
        let token:string = request.header("Authorization");
        if(token) {
            token = token.replace("Bearer ", "");
            const verification: any = this.jwtService.decode(token,);
            request.superadmin = verification.superadmin;
        }
        return next.handle()
    }

}