import {  HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import { LoginUser, UserPayload } from 'src/Dtos/auth.user.Dtos';
import { CreateSchedule, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { Schedule } from 'src/Entity/schedule.model';
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
        return token;
    }

    async logout (headerToken: string, authPayload: UserPayload) {
        const existedUser = await this.userService.findUserById(authPayload.userId);
        existedUser.tokens = existedUser.tokens.filter(token => {
                return token.token !== headerToken;
        });
        await existedUser.save();
        return "You have successfully logged out.";
    }

    async createSchedule(schedule:CreateSchedule, userid: ObjectId | string):Promise<Schedule>{
            console.log(schedule, "SCHEDULE CREATE")
            const newSchedule = await this.userService.createSchedule(schedule, userid);
            return newSchedule;
    }

    async updateSchedule(schedule: UpdateSchedule, scheduleId: ObjectId):Promise<Schedule>{
         const updatedSchedule = await this.userService.editSchedule(schedule, scheduleId);
         return updatedSchedule;
    }

    async deleteSchedule(scheduleId: ObjectId):Promise<Schedule>{
         const deletedSchedule = await this.userService.deleteSchedule(scheduleId);
         return deletedSchedule;
    }

    async getSchedules(userid: ObjectId | string, status : string | undefined):Promise<Schedule[]> {
        const allSchedules = await this.userService.getAllSchedules(userid, status);
        return allSchedules;
    }

    // getAllTrainers() {
    //     return this.userService.getAllTrainers();
    // }
}
