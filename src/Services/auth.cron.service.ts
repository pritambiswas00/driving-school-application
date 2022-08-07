import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LazyModuleLoader } from "@nestjs/core";
import { Cron,CronExpression } from "@nestjs/schedule"
import { UserService } from "./user.service";


@Injectable()
export class CronService {
    constructor(private readonly userService:UserService,private readonly configService:ConfigService, private readonly lazyModuleLoader: LazyModuleLoader){}
      @Cron(CronExpression.EVERY_12_HOURS)
      async deleteInvalidTokenAdmin(){
         await this.userService.deleteAllTokens();
     }
}
