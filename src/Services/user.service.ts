import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../Entity/user.model';
import { ScheduleService } from './schedule.service';
import { UtilService } from 'src/Utils/Utils';
import { TrainerService } from './trainer.service';
import { CreateUser, UpdateUser } from 'src/Dtos/admin.dtos';
import { CreateSchedule, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { ObjectId } from 'mongodb';
import { Schedule } from 'src/Entity/schedule.model';
import { ExceptionHandler } from 'winston';
import { Trainer } from 'src/Entity/trainer.model';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>, private readonly scheduleService: ScheduleService, private readonly configService: ConfigService, private readonly utilService: UtilService, private readonly trainerService: TrainerService, private readonly mailerService:MailerService) { }

    async create(user: CreateUser) {
        try {

            const newUser = new this.userModel(user);
            await newUser.save();
            await this.mailerService.sendMail({
                to: newUser.email.toString(),
                subject: 'Greeting from Driving School',
                template: './email.hbs',
                context: {
                    SMTP_USERNAME: this.configService.get<string>('SMTP_USERNAME')
                }
            });
            return newUser;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

    }

    findAllUsers() {
        return this.userModel.find({});
    }

    async updateUser(user: UpdateUser, userId: ObjectId): Promise<User> {
        const isUserExist = await this.userModel.findOne({ _id: userId });
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
                    //    let startDate:any = this.utilService.changeDateFormat(isUserExist.startDate)
                    //    startDate = new Date(startDate);
                    //    startDate = this.utilService.convertToUnix(startDate);
                    //    let endDate: any = user[updatedUserKeys[i]];
                    //    endDate = new Date("22-08-2022");
                    //    if(!endDate) {
                    //      console.log("invalid date")
                    //    }
                    //    console.log(startDate, endDate, user[updatedUserKeys[i]]);
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
        const user = await this.userModel.findByIdAndDelete(userId);
        if (!user) {
            throw new NotFoundException(`User ${userId} does not exist`);
        }
        return user;
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email: email });
        return user;
    }

    async findUserByPhoneNumber(phonenumber: string): Promise<User> {
        const user = await this.userModel.findOne({ phonenumber: phonenumber });
        return user;
    }

    findUserById(id: ObjectId | string) {
        return this.userModel.findOne({ _id: id });
    }

    async getUser(userId: ObjectId): Promise<Object> {
        try {
            const user: User | null = await this.findUserById(userId);
            if (!user) {
                throw new BadRequestException(`User ${userId} not found`)
            }
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

    async createSchedule(scheduleuser: CreateSchedule, userid: ObjectId | string): Promise<Schedule> {
        try {
            const { scheduledate, trainerdetails } = scheduleuser;
            const todaysDate = new Date();
            const scheduleDate = new Date(scheduledate);
            const todaysUnixDate = this.utilService.convertToUnix(todaysDate);
            const scheduleUnixDate = this.utilService.convertToUnix(scheduleDate);
            const scheduleDateLimit = +this.configService.get("SCHEDULE_DATE_LIMIT") * 24 * 60 * 60;
            const isUserExist = await this.findUserById(userid);
            const isScheduleExist = await this.scheduleService.findScheduleBasedOnDateAndUserId(scheduledate, userid);
            const isTrainerExist = await this.trainerService.findTrainerBasedOnEmail(trainerdetails.email);
            if (scheduleUnixDate - todaysUnixDate > scheduleDateLimit) {
                throw new BadRequestException(`Schedule must be ${this.configService.get("SCHEDULE_DATE_LIMIT")} days prior to today's date.`);
            } else if (isScheduleExist) {
                throw new BadRequestException(`Schedule with date ${scheduledate} is already scheduled.`);
            } else if (!isTrainerExist) {
                throw new NotFoundException(`Trainer not found.`);
            }
            else if (!isUserExist) {
                throw new NotFoundException(`User not found.`);
            }
            const newSchedule = await this.scheduleService.create(scheduleuser, userid);
            return newSchedule;

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async editSchedule(updateschedule: UpdateSchedule, scheduleId: ObjectId): Promise<Schedule> {
        const isScheduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
        if (!isScheduleExist) throw new NotFoundException(`Schedule not found.`);
        const updateKeys = Object.keys(updateschedule);
        for (let i = 0; i < updateKeys.length; i++) {
            switch (updateKeys[i]) {
                case "schedulename":
                case "scheduledate":
                case "scheduletime":
                case "status":
                    isScheduleExist[updateKeys[i]] = updateschedule[updateKeys[i]];
                    break;
                case "trainerdetails":
                    const isTrainer = await this.trainerService.findTrainerBasedOnEmail(updateschedule[updateKeys[i]].email);
                    if (!isTrainer) {
                        throw new NotFoundException("Trainer not found.");
                    }
                    isScheduleExist[updateKeys[i]] = updateschedule[updateKeys[i]];
                    const newDate = new Date();
                    isScheduleExist[updateKeys[i]]["updatedAt"] = newDate
                    break;
            }
        }
        const newDate: Date = new Date();
        isScheduleExist["updatedAt"] = newDate;
        await isScheduleExist.save();
        return isScheduleExist;
    }

    async deleteSchedule(scheduleId: ObjectId): Promise<Schedule> {
        let isSchduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
        if (!isSchduleExist) throw new NotFoundException(`Schedule not found.`);
        isSchduleExist = await this.scheduleService.deleteSchedule(scheduleId);
        return isSchduleExist;
    }

    async getAllSchedules(userid: ObjectId | string | undefined, queryStatus: string | undefined): Promise<Schedule[]> {
        const allSchedules = await this.scheduleService.getAllSchdulesByUserid(userid, queryStatus);
        if (!allSchedules) throw new NotFoundException(`Schedule not found.`);
        if (allSchedules.length === 0) throw new NotFoundException(`Schedule not found for the user.`);
        return allSchedules;
    }

    async getAllTrainers(status: string | undefined): Promise<Trainer[]> {
        return this.trainerService.getAllTrainer(status);
    }

    async deleteAllTokens(): Promise<string> {
        try {
            await this.userModel.updateMany({}, { $set: { tokens: [] } });
            return "Successfully deleted all tokens.";
        } catch (error) {
            throw new Error(error)
        }
    }



}