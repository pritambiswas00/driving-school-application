import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class RootGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService){}
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
          try{
            let token:string|undefined = request.header("Authorization");
            token = token.replace("Bearer ", "");
            this.jwtService.verify(token, { secret: this.configService.get<string>("JWT_SECRET_ROOT")});
            return request;
          }catch(error) {
            throw new UnauthorizedException(error);
          }
    }
}