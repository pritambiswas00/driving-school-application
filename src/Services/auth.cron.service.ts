import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron,CronExpression } from "@nestjs/schedule"
import { UserService } from "./user.service";


@Injectable()
export class CronService {
    constructor(private readonly userService:UserService,private readonly configService:ConfigService){}
      @Cron(CronExpression.EVERY_12_HOURS)
      async deleteInvalidTokenAdmin(){
         console.log("Timeout started")
         const message:string = await this.userService.deleteAllTokens();
         console.log(message);
     }
}
