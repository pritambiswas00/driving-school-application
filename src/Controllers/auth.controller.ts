import { Controller, Inject, Get, Logger, Post, Body, Param, Patch, Delete, Session, UseInterceptors, UseGuards, HttpStatus, Headers, Query, BadRequestException } from '@nestjs/common';
import { AuthService } from "../Services/auth.service";
import { LoginUser, UserPayload } from '../Dtos/auth.user.Dtos';
import { ConfigService } from '@nestjs/config';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsUser } from 'src/Decorators/isUser.decorator';
import { IsUserInterceptor } from 'src/Interceptors/isUser.interceptor';
import { UserGuard } from 'src/Guards/isUser.guard';
import { CreateSchedule, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { ObjectId } from 'mongodb';
import { TrainerStatus } from 'src/Dtos/trainer.dto';


@ApiTags("User")
@Controller('auth')
@UseInterceptors(IsUserInterceptor)
export class AuthController {
  constructor(
   private readonly authService: AuthService, private readonly config: ConfigService
  ){}
  //////////////Login User///////////////////////
  @ApiOperation({ summary: 'Login User ****' })
  @ApiResponse({ status: 200, description: 'User Logged in' })
  @ApiResponse({ status: 403, description: 'Forbidden. Not Authenticated.' })
  @Post("/login")
  async login (@Body() body: LoginUser) {
    const [token, isUserPhoneExist] = await this.authService.login(body);
    return {
        status: HttpStatus.OK,
        message: "Successfully logged in...",
        user: isUserPhoneExist,
        access_token: token
    }
  }


  /////////////Logout User///////////////
  @ApiOperation({ summary: 'Logout User ****' })
  @Post("/logout")
  @UseGuards(UserGuard)
  async logout (@Headers("Authorization") authToken:string, @IsUser() userPayload: UserPayload ) {
          const token = authToken.replace("Bearer ", "");
          const logoutUser:string= await this.authService.logout(token, userPayload);
          return {
              status :HttpStatus.OK,
              message : logoutUser
          }
  }

  ///////////User Schedule Create///////////////
  @ApiOperation({ summary: 'Create Schedule ****' })
  @Post("/user/schedule/create")
  @UseGuards(UserGuard)
  async createSchedule(@Body() body: CreateSchedule, @IsUser() user: any) {
        const newSchedule = await this.authService.createSchedule(body, user._id);
        return {
            status :HttpStatus.OK,
            schedule: newSchedule
        }
  }

  @ApiOperation({ summary: 'Get Schedules ****' })
  @Get("/user/schedule")
  @UseGuards(UserGuard)
  async getSchedule(@IsUser() user: any, @Query("status") status : string | undefined) {
       const allSchedules = await this.authService.getSchedules(user.userid, status);
       return {
           status :HttpStatus.OK,
           allSchedules : allSchedules
       }
  }

  @ApiOperation({ summary: 'Edit Schedule ****' })
  @Patch("/user/schedule/edit/:scheduleId")
  @UseGuards(UserGuard)
  async editSchedule(@Body() body:UpdateSchedule, @Param("scheduleId") scheduleId: ObjectId, @IsUser() user: any) {
        return this.authService.updateSchedule(body, scheduleId);
  }

  @ApiOperation({ summary: 'Delete Schedule ****' })
  @Delete("/user/schedule/delete/:scheduleId")
  @UseGuards(UserGuard)
  async deleteSchedule(@Param("scheduleId") scheduleId: ObjectId, @IsUser() user: any) {
       return this.authService.deleteSchedule(scheduleId);
  }

  @ApiOperation({ summary: 'Get All Trainer ****' })
  @Get("/user/getAllTrainers")
  @UseGuards(UserGuard)
  async getTrainers(@Query("status") status : TrainerStatus, @IsUser() user: any) {
      const trainers = await this.authService.getAllTrainers(status);
      if(!trainers) {
          throw new BadRequestException("No trainers found.");
      }
      return {
         status : HttpStatus.OK,
         trainers : trainers
      }
  }

}
