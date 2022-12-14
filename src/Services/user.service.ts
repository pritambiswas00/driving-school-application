import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../Entity/user.model';
import { ScheduleService } from './schedule.service';
import { UtilService } from 'src/Utils/Utils';
import { TrainerService } from './trainer.service';
import { CreateUser, UpdateUser } from 'src/Dtos/admin.dtos';
import { CreateSchedule, ScheduleStatus, ScheduleStatusChange, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { ObjectId } from 'mongodb';
import { Schedule } from 'src/Entity/schedule.model';
import { Trainer } from 'src/Entity/trainer.model';
import { MailerService } from '@nestjs-modules/mailer';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserEventTypes } from 'src/Events/Emit/User.emit';
import { format } from "date-fns"
import { LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>, private readonly scheduleService: ScheduleService, private readonly configService: ConfigService, private readonly utilService: UtilService, private readonly trainerService: TrainerService, private readonly mailerService:MailerService, private readonly eventEmitter:EventEmitter2, private readonly lazyModuleLoader: LazyModuleLoader) { }

    async create(user: CreateUser) {
        try {
            const newUser = new this.userModel(user);
            await newUser.save();
            await this.eventEmitter.emitAsync(UserEventTypes.NEW_USER_CREATED, newUser);
            return newUser;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    ////////////////////////////////////////////////
    findAllUsers() {
        return this.userModel.find({});
    }

    async findUserByPhoneNumber(phonenumber: string): Promise<User> {
        const user = await this.userModel.findOne({ phonenumber: phonenumber });
        return user;
    }

    async updateUser(user: UpdateUser, userId: ObjectId): Promise<User> {
        const isUserExist = await this.userModel.findOne({ _id: new Types.ObjectId(userId)});
        if (!isUserExist) {
            throw new NotFoundException(`User ${userId} does not exist`);
        }
        const updatedUserKeys = Object.keys(user);
        for (let i = 0; i < updatedUserKeys.length; i++) {
            switch (updatedUserKeys[i]) {
                case "name":
                case "email":
                case "allowschedule":
                    isUserExist[updatedUserKeys[i]] = user[updatedUserKeys[i]];
                    break;
                case "endDate":
                    const endDate = new Date(user[updatedUserKeys[i]]);
                    const endDateUnix = this.utilService.convertToUnix(endDate);
                    const startDate = new Date(isUserExist.startDate.toString())
                    const startDateUnix = this.utilService.convertToUnix(startDate);
                    if(startDateUnix > endDateUnix) {
                        throw new BadRequestException(`End date should be greater than start date.`);
                    }
                    isUserExist[updatedUserKeys[i]] = user[updatedUserKeys[i]];
                    break;
                default:
                    break;
            }
        }
        const newDate: Date = new Date();
        isUserExist["updatedAt"] = newDate;
        await isUserExist.save();
        return isUserExist;
    }

    async userDelete(userId: ObjectId): Promise<User> {
        const user = await this.userModel.findByIdAndDelete(new Types.ObjectId(userId));
        if (!user) {
            throw new NotFoundException(`User ${userId} does not exist`);
        }
        return user;
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email: email });
        return user;
    }

    async findUserByPhoneNumberAndEmail(phonenumber: string, email:string): Promise<User> {
        const user = await this.userModel.findOne({ phonenumber: { $eq : phonenumber}, email: { $eq : email }});
        return user;
    }

    async findUserById(id: ObjectId):Promise<User> {
        const user:User = await this.userModel.findOne({ _id: new Types.ObjectId(id)});
        if(!user){
            throw new NotFoundException(`User ${id} not found`)
        }
        return user;
    }

    async getUser(userId: ObjectId): Promise<Object> {
        try {
            const user:User = await this.findUserById(userId);
            const userschedules = await this.scheduleService.getAllSchdulesByUserid(userId, undefined);
            return {
                status: HttpStatus.OK,
                user: user,
                schedules: userschedules
            }

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async createSchedule(scheduleuser: CreateSchedule, userid: ObjectId): Promise<Schedule> {
            const { scheduledate, scheduletime, trainerdetails } = scheduleuser;
            const splitScheduleDate = scheduledate.split("/");
            const fomratedScheduleDate = format(new Date(`${splitScheduleDate[2]}-${splitScheduleDate[1]}-${splitScheduleDate[0]}`), "yyyy-MM-dd");
            const newScheduleDate = new Date(fomratedScheduleDate);
            const todaysDate = new Date();
            const todaysUnixDate = this.utilService.convertToUnix(todaysDate);
            const scheduleUnixDate = this.utilService.convertToUnix(newScheduleDate);
            const scheduleDateLimit = +this.configService.get("SCHEDULE_DATE_LIMIT")* 24 * 60 * 60;
            const isUserExist:User = await this.findUserById(userid);
            if(+isUserExist.allowschedule === 0) {
                throw new BadRequestException(`User ${isUserExist.name} does not has any left schedule creation allotment.`);
            }
            const splitStartDate = isUserExist.startDate.toString().split("/");
            const fomratedStartDate = format(new Date(`${splitStartDate[2]}-${splitStartDate[1]}-${splitStartDate[0]}`), "yyyy-MM-dd");
            const startDate = new Date(fomratedStartDate);
            const startDateUnix = this.utilService.convertToUnix(startDate);
            await this.scheduleService.findScheduleBasedOnDateAndUserIdAndStatus(scheduledate, userid);
            const trainer:Trainer = await this.trainerService.findTrainerAvailableForUser(trainerdetails.email, trainerdetails.phonenumber, scheduletime, scheduledate);
            if( scheduleUnixDate < startDateUnix){
                throw new ServiceUnavailableException(`Schedule create will be available on ${isUserExist.startDate}`);
            }
            else if ((scheduleUnixDate - todaysUnixDate) > scheduleDateLimit) {
                throw new BadRequestException(`Schedule must be ${this.configService.get("SCHEDULE_DATE_LIMIT")} days prior to today's date.`);
            }
            await this.updateUserAllowSchedule(isUserExist._id); 
            const newSchedule = await this.scheduleService.create(scheduleuser, isUserExist.name, isUserExist.startDate, isUserExist.endDate, isUserExist.phonenumber, isUserExist._id);
            await this.trainerService.addNewScheduleToTrainer(trainer.email, trainer.phonenumber,newSchedule._id, newSchedule.scheduledate, newSchedule.scheduletime, newSchedule.status);
            return newSchedule;
    }

    async updateUserAllowSchedule (userid: ObjectId):Promise<void> {
            await this.userModel.findByIdAndUpdate(new Types.ObjectId(userid), { $inc: { allowschedule: -1 }});
    }

    async updateUserScheduleAllotment(userid:ObjectId, type:string) {
           if(type === "INC") {
                await this.userModel.findByIdAndUpdate(new Types.ObjectId(userid), { $inc: { allowschedule: +1 }});
           }else if(type === "DEC") {
               await this.userModel.findByIdAndUpdate(new Types.ObjectId(userid), { $inc: { allowschedule: -1 }});
           }
    }

    async editSchedule(updateschedule: UpdateSchedule, scheduleId: ObjectId, userid: ObjectId | undefined): Promise<Schedule> {
        let isScheduleExist:Schedule;
        if(!userid){
           isScheduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
        }else{
          isScheduleExist = await this.scheduleService.findScheduleBasedOnScheduleIdAndUserId(scheduleId, userid);
        }
        if (!isScheduleExist) throw new NotFoundException(`Schedule not found.`);
        else if (isScheduleExist.status === ScheduleStatus.COMPLETED || isScheduleExist.status === ScheduleStatus.CANCELLED ) throw new BadRequestException(`Schedule is already ${isScheduleExist.status}. cannot be edited.`);
        const updatedSchedule = await this.scheduleService.updateSchedule(updateschedule, scheduleId);
        return updatedSchedule;
    }

    async deleteSchedule(scheduleId: ObjectId): Promise<Schedule> {
        let isScheduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
        if (!isScheduleExist) throw new NotFoundException(`Schedule not found.`);
        else if(isScheduleExist.status !== ScheduleStatus.PENDING) throw new BadRequestException(`Schedule status is ${isScheduleExist.status} and cannot be deleted.`);
        isScheduleExist = await this.scheduleService.deleteSchedule(scheduleId);
        await this.eventEmitter.emitAsync(UserEventTypes.USER_SCHEDULE_UPDATE, isScheduleExist);
        return isScheduleExist;
    }

    async getAllSchedules(userid: ObjectId, queryStatus: string | undefined): Promise<Schedule[]> {
        const allSchedules = await this.scheduleService.getAllSchdulesByUserid(userid, queryStatus);
        if (!allSchedules) throw new NotFoundException(`Schedule not found.`);
        if (allSchedules.length === 0) throw new NotFoundException(`Schedule not found.`);
        return allSchedules;
    }

    async getSchedulesForAdmin(userid: ObjectId | undefined, queryStatus: string | undefined): Promise<Schedule[]> {
             const allSchedules = await this.scheduleService.getAllSchdulesForAdmin(userid, queryStatus);
             return allSchedules;
    }

    async getAllTrainers(status: string | undefined): Promise<Trainer[]> {
        const trainers = await this.trainerService.getAllTrainer(status);
        return trainers;
    }

    async deleteAllTokens(): Promise<string> {
        try {
            await this.userModel.updateMany({}, { $set: { tokens: [] } });
            return "Successfully deleted all tokens.";
        } catch (error) {
            throw new Error(error)
        }
    }

    async logout(authToken:string, user: User):Promise<User> {
        const isUserExist = await this.userModel.findById(new Types.ObjectId(user._id));
        isUserExist.tokens = isUserExist.tokens.filter(token => {
            return token.token !== authToken;
    });
    await isUserExist.save();
    if(!isUserExist) throw new BadRequestException(`You are not logged in...`);
    return isUserExist;
    }

    // async changeUserScheduleStatus(scheduleId: ObjectId, userId: ObjectId, status:ScheduleStatusChange ):Promise<Schedule>{
    //      await this.scheduleService.findScheduleBasedOnScheduleIdAndUserId(scheduleId, userId);
    //      const updatedSchedule = await this.scheduleService.updateStatusSchedule(scheduleId, status.status);
    //      return updatedSchedule;
    // }
}
