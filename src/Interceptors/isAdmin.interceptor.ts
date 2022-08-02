import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AdminPayload } from "src/Dtos/admin.dtos";
import { Admin } from "src/Entity/admin.model";
import { AdminService } from "src/Services/admin.service";


@Injectable()
export class IsAdminInterceptor implements NestInterceptor{

    constructor(private readonly adminService:AdminService, private readonly jwtService:JwtService, private readonly configService: ConfigService){}

    async intercept(context: ExecutionContext, next: CallHandler<any>){
        const request = context.switchToHttp().getRequest();
        let token:string = request.header("Authorization");
        if(token) {
           token = token.replace("Bearer ", "");
           const verification:any = this.jwtService.decode(token);
           const admin:Admin = await this.adminService.findAdminById(verification.adminId)
            request.admin = admin;
        }
        return next.handle();
    }
 
}