import {  HttpStatus, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { LoginUser, UserPayload } from 'src/Dtos/auth.user.Dtos';
import { CreateSchedule, ScheduleStatusChange, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { Schedule } from 'src/Entity/schedule.model';
import { Trainer } from 'src/Entity/trainer.model';
import { User } from 'src/Entity/user.model';
import { UtilService } from 'src/Utils/Utils';
import { AdminService } from './admin.service';
import { UserService }  from "./user.service";
@Injectable()
export class AuthService {
    constructor(private readonly userService : UserService, private readonly utils: UtilService, private readonly jwtService:JwtService, private readonly configService:ConfigService, private readonly adminService:AdminService) {}


    async login(userDetails : LoginUser) {
        const isUserExist = await this.adminService.findAdminByEmail(userDetails.email);
        if(!isUserExist) {
            throw new UnauthorizedException("User does not exist...")
        }
        const isUserPhoneExist:any = await this.userService.findUserByPhoneNumber(userDetails.phonenumber);
        if(!isUserPhoneExist) {
              throw new UnauthorizedException("User does not exist...")
        }
        const payload = { userId: isUserPhoneExist._id, email: isUserPhoneExist.email};
        const token = this.jwtService.sign(payload, { secret: this.configService.get("JWT_SECRET_AUTH")});
        const date = new Date();
        isUserPhoneExist.tokens = [...isUserPhoneExist.tokens, { token, date }]
        isUserPhoneExist["updatedAt"] = date;
        await isUserPhoneExist.save();
        return [token, isUserPhoneExist];
    }

    async logout (headerToken: string, user: User):Promise<string> {
        await this.userService.logout(headerToken, user);
        return "You have successfully logged out.";
    }

    async createSchedule(schedule:CreateSchedule, userid: ObjectId):Promise<Schedule>{
            const newSchedule = await this.userService.createSchedule(schedule, userid);
            return newSchedule;
    }

    async updateSchedule(schedule: UpdateSchedule, scheduleId: ObjectId, userid: ObjectId):Promise<Schedule>{
         const updatedSchedule = await this.userService.editSchedule(schedule, scheduleId, userid);
         return updatedSchedule;
    }

    async deleteSchedule(scheduleId: ObjectId):Promise<Schedule>{
         const deletedSchedule = await this.userService.deleteSchedule(scheduleId);
         return deletedSchedule;
    }

    async getSchedules(userid: ObjectId, status : string | undefined):Promise<Schedule[]> {
        const allSchedules = await this.userService.getAllSchedules(userid, status);
        return allSchedules;
    }

    async getAllTrainers(status: string | undefined):Promise<Trainer[]> {
              const allTrainers = await this.userService.getAllTrainers(status);
              return allTrainers;
    }

    // async changeUserScheduleStatus(scheduleId:ObjectId, status:ScheduleStatusChange, userId:ObjectId) :Promise<Schedule>{
    //     const updatedSchedule = await this.userService.changeUserScheduleStatus(scheduleId, userId, status);
    //     return updatedSchedule;
    // }
     
}
