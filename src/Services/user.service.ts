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

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>, private readonly scheduleService: ScheduleService, private readonly configService: ConfigService, private readonly utilService: UtilService, private readonly trainerService: TrainerService, private readonly mailerService:MailerService, private readonly eventEmitter:EventEmitter2) { }

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
            const todaysDate = new Date();
            const scheduleDate = new Date(scheduledate);
            const todaysUnixDate = this.utilService.convertToUnix(todaysDate);
            const scheduleUnixDate = this.utilService.convertToUnix(scheduleDate);
            const scheduleDateLimit = +this.configService.get("SCHEDULE_DATE_LIMIT") * 24 * 60 * 60;
            const isUserExist:User = await this.findUserById(userid);
            const startDate = new Date(isUserExist.startDate.toString());
            const startDateUnix = this.utilService.convertToUnix(startDate);
            await this.scheduleService.findScheduleBasedOnDateAndUserId(scheduledate, userid);
            const trainer:Trainer = await this.trainerService.findTrainerAvailableForUser(trainerdetails.email, trainerdetails.phonenumber, scheduletime, scheduledate);
            if( scheduleUnixDate< startDateUnix){
                throw new ServiceUnavailableException(`Schedule create will be available on ${isUserExist.startDate}`);
            }
            else if (scheduleUnixDate - todaysUnixDate > scheduleDateLimit) {
                throw new BadRequestException(`Schedule must be ${this.configService.get("SCHEDULE_DATE_LIMIT")} days prior to today's date.`);
            } 
            const newSchedule = await this.scheduleService.create(scheduleuser, isUserExist.name, isUserExist.startDate, isUserExist.endDate, isUserExist.phonenumber, isUserExist._id);
            await this.trainerService.addNewScheduleToTrainer(trainer.email, trainer.phonenumber,newSchedule._id, newSchedule.scheduledate, newSchedule.scheduletime, newSchedule.status);
            return newSchedule;
    }

    async editSchedule(updateschedule: UpdateSchedule, scheduleId: ObjectId, userid: ObjectId | undefined): Promise<Schedule> {
        let isScheduleExist:Schedule;
        if(!userid){
           isScheduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
        }else{
          isScheduleExist = await this.scheduleService.findScheduleBasedOnScheduleIdAndUserId(scheduleId, userid);
        }
        if (!isScheduleExist) throw new NotFoundException(`Schedule not found.`);
        const updatedSchedule = await this.scheduleService.updateSchedule(updateschedule, scheduleId);
        return updatedSchedule;
    }

    async deleteSchedule(scheduleId: ObjectId): Promise<Schedule> {
        let isSchduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
        if (!isSchduleExist) throw new NotFoundException(`Schedule not found.`);
        isSchduleExist = await this.scheduleService.deleteSchedule(scheduleId);
        return isSchduleExist;
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
