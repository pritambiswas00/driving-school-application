import { Body, Controller, Delete, Get, Headers, HttpStatus, Inject, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ObjectId } from "mongodb";
import { AppService } from "./app.service";
import { AddAdmin, Login } from "./Dtos/admin.dtos";
import { RootGuard } from "./Guards/isRoot.guard";
import { IsRootInterceptor } from "./Interceptors/isRoot.interceptor";
import { IsRoot } from "./Decorators/isRoot.decorators";
import { Logger } from "winston";
import { threadId } from "worker_threads";



@ApiTags("Root")
@Controller("root")
@UseInterceptors(IsRootInterceptor)
export class AppController {
     constructor(private readonly appService: AppService) {}
     
     @ApiOperation({ summary: 'Login SuperAdmin ****' })
     @Post("/login")
     async login(@Body() superadmin:Login){
          const token = this.appService.login(superadmin);
          return{
               status: HttpStatus.OK,
               message: "Successfully logged in...",
               access_token: token
          }
     }

     @ApiOperation({ summary: 'Logout SuperAdmin ****' })
     @Post("/logout")
     @UseGuards(RootGuard)
     async logout(@IsRoot() superadmin:Object, @Headers("Authorization") authToken :string){
          return {
               message: "Successfully logged out."
          }
     }

     @ApiOperation({ summary: 'Get All Admins ****' })
     @Get("/getAllAdmins")
     @UseGuards(RootGuard)
     async getAllAdmins(@IsRoot() superadmin: any){
          console.log(superadmin);
         const admins = await this.appService.getAllAdmins();
         return admins;
     }

     @ApiOperation({ summary: 'Add Admin ****' })
     @Post("/addAdmin")
     @UseGuards(RootGuard)
     async addAdmin(@Body() admin: AddAdmin){
            return this.appService.addAdmin(admin);
     }

     @ApiOperation({ summary: 'Delete Admin ****' })
     @Delete("/deleteAdmin/:adminId")
     @UseGuards(RootGuard)
     async removeAdmin(@Param("adminId") param : ObjectId){
          return this.appService.deleteAdmin(param);
     }
}