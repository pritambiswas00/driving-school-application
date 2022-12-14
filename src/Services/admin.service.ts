import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Admin, AdminDocument } from 'src/Entity/admin.model';
import { UserService } from './user.service';
import { CreateUser, Login, UpdateUser } from 'src/Dtos/admin.dtos';
import { scrypt as _scrypt } from "crypto";
import { UtilService } from 'src/Utils/Utils';
import { TrainerService } from './trainer.service';
import { ObjectId } from 'mongodb';
import { User } from 'src/Entity/user.model';
import { TrainerCreate, TrainerUpdate } from 'src/Dtos/trainer.dto';
import { CreateSchedule, ScheduleStatus, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { Schedule } from 'src/Entity/schedule.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Trainer } from 'src/Entity/trainer.model';
import { MailerService } from '@nestjs-modules/mailer';
import { LazyModuleLoader } from '@nestjs/core';
import { ScheduleService } from './schedule.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScheduleEventTypes, ScheduleStatusUpdateEvent } from 'src/Events/Emit/Schedule.emit';
import { UserEventTypes } from 'src/Events/Emit/User.emit';
import { AdminEventTypes, AdminTrainerAndUserUpdateEvent } from 'src/Events/Emit/Admin.emit';



@Injectable()
export class AdminService {
     constructor(@InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>, private readonly userService: UserService, private readonly utilService: UtilService, private readonly trainerService: TrainerService, private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly lazyModuleLoader: LazyModuleLoader, private readonly scheduleService:ScheduleService, private readonly eventEmitter: EventEmitter2) { }

     async login(admin: Login): Promise<string> {
          let isAdminExist:Admin = await this.adminModel.findOne({ email: admin.email });
          if (!isAdminExist) {
               throw new UnauthorizedException(`Email ${admin.email} doesnot exist.`)
          }
          const isMatched = await this.utilService.comparePassword(admin.password, isAdminExist.password)
          if (!isMatched) {
               throw new UnauthorizedException("Password did not match.")
          }
          const payload = { adminId: isAdminExist._id, email: isAdminExist.email };
          const token = this.jwtService.sign(payload, { secret: this.configService.get<string>("JWT_SECRET_ADMIN")});
          const date = new Date();
          await this.adminModel.updateOne({
              email: { $eq : admin.email },
              phonenumber: { $eq : isAdminExist.phonenumber }
          }, {
               $push : { tokens : { token , date } }
          })
          return token;
     }

     async logout(headerToken: string, admin: any): Promise<string> {
          try {
               const existedAdmin = await this.adminModel.findOne({ _id: new Types.ObjectId(admin._id) });
               if(!existedAdmin) throw new BadRequestException("You are not logged in.");
               existedAdmin.tokens = existedAdmin.tokens.filter(token => {
                    return token.token !== headerToken;
               });
               await existedAdmin.save();
               return "You have successfully logged out.";
          } catch (error) {
               throw new BadRequestException(error);
          }
     }

     async findAdminById(id: ObjectId | string): Promise<Admin> {
          return this.adminModel.findOne({ _id: new Types.ObjectId(id)});
     }

     async findAdminByEmail(email: string): Promise<Admin> {
          return this.adminModel.findOne({ email: email })
     }

     async createUser(user: CreateUser): Promise<User> {
          let isUserExist:User = await this.userService.findUserByPhoneNumberAndEmail(user.phonenumber, user.email);
          if (isUserExist) {
               throw new BadRequestException(`User ${isUserExist.email} with phone ${user.phonenumber} already exists`);
          }
          isUserExist = await this.userService.create(user);
          return isUserExist;
     }

     async getAllUsers(): Promise<User[]> {
          const allUsers = await this.userService.findAllUsers();
          if (!allUsers) {
               throw new NotFoundException("No users found.");
          }
          return allUsers;
     }

     async getUser(userId: ObjectId) {
          return this.userService.getUser(userId);
     }

     async editUser(user: UpdateUser, userId: ObjectId): Promise<User> {
          const updatedUser = await this.userService.updateUser(user, userId);
          if (!updatedUser) {
               throw new BadRequestException("Could not update user.")
          }
          return updatedUser;
     }

     async deleteUser(userId: ObjectId): Promise<User> {
          const deletedUser = await this.userService.userDelete(userId);
          if (!deletedUser) {
               throw new BadRequestException("Could not delete user.");
          }
          return deletedUser;
     }

     async createSchedule(userschedule: CreateSchedule, userId: ObjectId): Promise<Schedule> {
          const newSchedule = await this.userService.createSchedule(userschedule, userId);
          return newSchedule;
     }

     async deleteSchedule(scheduleId: ObjectId): Promise<Schedule> {
           const isScheduleExist = await this.scheduleService.findScheduleBasedOnId(scheduleId);
           if(!isScheduleExist) throw new NotFoundException("Schedule not found.");
           else if(isScheduleExist.status === ScheduleStatus.COMPLETED)throw new BadRequestException("Completed schedule can not be deleted.");
           else if(isScheduleExist.status === ScheduleStatus.PENDING) {
              await this.eventEmitter.emitAsync(AdminEventTypes.ADMIN_TRAINER_USER_UPDATE, new AdminTrainerAndUserUpdateEvent(isScheduleExist));
           }
          return this.scheduleService.deleteSchedule(scheduleId);
     }

     async editSchedule(userschedule: UpdateSchedule, scheduleId: ObjectId): Promise<Schedule> {
          const updatedSchedule = await this.userService.editSchedule(userschedule, scheduleId, undefined);
          return updatedSchedule;
     }

     async getSchedules(userId: ObjectId| undefined, queryStatus: string | undefined): Promise<Schedule[]> {
          const schedules = await this.userService.getSchedulesForAdmin(userId, queryStatus)
          return schedules;
     }

     async addTrainer(newtrainer: TrainerCreate): Promise<Trainer> {
          let trainerExist = await this.trainerService.findTrainerBasedOnEmailAndPhone(newtrainer.email, newtrainer.phonenumber);
          if (trainerExist) {
               throw new BadRequestException(`Trainer already exists.`);
          }
          trainerExist = await this.trainerService.create(newtrainer);
          return trainerExist;
     }

     async editTrainer(trainerdetails: TrainerUpdate, trainerId: ObjectId): Promise<Trainer> {
          const editedTrainer = await this.trainerService.editTrainer(trainerdetails, trainerId);
          return editedTrainer;
     }

     async deleteTrainer(trainerid: ObjectId): Promise<Trainer> {
          const isTrainerExist = await this.trainerService.deleteTrainer(trainerid);
          if (!isTrainerExist) {
               throw new NotFoundException("Trainer not found.");
          }
          return isTrainerExist;
     }

     async getAllTrainers(status: string | undefined): Promise<Trainer[]> {
          const trainers = await this.trainerService.getAllTrainer(status);
          if (!trainers) {
               throw new NotFoundException("Trainers not found.");
          } else if (trainers.length === 0) {
               throw new NotFoundException("Trainers not found.");
          }
          return trainers;
     }


}
