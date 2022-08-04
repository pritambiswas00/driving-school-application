import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import { Admin, AdminDocument } from 'src/Entity/admin.model';
import { UserService } from './user.service';
import { CreateUser, Login, UpdateUser } from 'src/Dtos/admin.dtos';
import { scrypt as _scrypt } from "crypto";
import { UtilService } from 'src/Utils/Utils';
import { TrainerService } from './trainer.service';
import { ObjectId } from 'mongodb';
import { User } from 'src/Entity/user.model';
import { TrainerCreate, TrainerUpdate } from 'src/Dtos/trainer.dto';
import { CreateSchedule, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { Schedule } from 'src/Entity/schedule.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Trainer } from 'src/Entity/trainer.model';
import { MailerService } from '@nestjs-modules/mailer';


 
@Injectable()
export class AdminService {
     constructor(@InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>, private readonly userService: UserService, private readonly utilService: UtilService, private readonly trainerService: TrainerService, private readonly jwtService: JwtService, private readonly configService:ConfigService) {}

     async login(admin: Login) : Promise<string>{
          const isAdminExist = await this.adminModel.findOne({ email: admin.email });
          if (!isAdminExist) {
               throw new UnauthorizedException(`Email ${admin.email} doesnot exist.`)
          }
          const isMatched = await this.utilService.comparePassword(admin.password, isAdminExist.password)
          if (!isMatched) {
               throw new UnauthorizedException("Password did not match.")
          }
          const payload = { adminId: isAdminExist._id, email: isAdminExist.email};
          const token = this.jwtService.sign(payload, { secret: this.configService.get("JWT_SECRET_ADMIN")});
          const date = new Date();
          isAdminExist.tokens = [...isAdminExist.tokens, { token, date }]
          isAdminExist["updatedAt"] = date;
          await isAdminExist.save();
          return token;
     }

     async logout(headerToken: string, admin: any):Promise<string> {
          const existedAdmin = await this.adminModel.findOne({ _id: admin._id});
          existedAdmin.tokens = existedAdmin.tokens.filter(token => {
                  return token.token !== headerToken;
          });
          await existedAdmin.save();
          return "You have successfully logged out.";
     }

     async findAdminById(id: ObjectId|string):Promise<Admin> {
          return this.adminModel.findOne({ _id: id });
     }

     async findAdminByEmail(email:string):Promise<Admin>{
            return this.adminModel.findOne({ email: email })
     }

     async createUser(user: CreateUser):Promise<User> {
          let isUserExist:User = await this.userService.findUserByPhoneNumber(user.phonenumber);
          if (isUserExist) {
               throw new BadRequestException(`User ${user.phonenumber} already exists`);
          }
          isUserExist = await this.userService.create(user);
          return isUserExist;
     }

     async getAllUsers():Promise<User[]>{
          const allUsers = await this.userService.findAllUsers();
          if (!allUsers) {
               throw new NotFoundException("No users found.");
          }
          return allUsers;
     }

     async getUser(userId: ObjectId) {
          return this.userService.getUser(userId);
     }

     async editUser(user: UpdateUser, userId: ObjectId):Promise<User>{
          const updatedUser = await this.userService.updateUser(user, userId);
          if(!updatedUser){
             throw new BadRequestException("Could not update user.")
          }
          return updatedUser;
   }

     async deleteUser(userId: ObjectId):Promise<User>{
        const deletedUser = await this.userService.userDelete(userId);
        if(!deletedUser){
             throw new BadRequestException("Could not delete user.");
        }

        return deletedUser;
     }

     async createSchedule(userschedule: CreateSchedule, userId: ObjectId):Promise<Schedule> {
          const newSchedule = await this.userService.createSchedule(userschedule, userId);
          return newSchedule;
     }

     async deleteSchedule(scheduleId : ObjectId) : Promise<Schedule> {
          return this.userService.deleteSchedule(scheduleId);
     }

     async editSchedule(userschedule: UpdateSchedule, scheduleId: ObjectId):Promise<Schedule> {
          const updatedSchedule = await this.userService.editSchedule(userschedule, scheduleId);
          return updatedSchedule;
     }

     async getSchedules(userId: ObjectId , queryStatus:string|undefined): Promise<Schedule[]>{
            const scheduleList = await this.userService.getAllSchedules(userId, queryStatus);
            return scheduleList; 
     }

     async addTrainer(newtrainer: TrainerCreate):Promise<Trainer> {
          let trainerExist = await this.trainerService.findTrainerBasedOnEmailAndPhone(newtrainer.email, newtrainer.phonenumber);
          if (trainerExist) {
               throw new BadRequestException(`Trainer already exists.`);
          }
          trainerExist = await this.trainerService.create(newtrainer);
          return trainerExist;
     }

     async editTrainer(trainerdetails: TrainerUpdate, trainerId: ObjectId):Promise<Trainer> {
          const editedTrainer = await this.trainerService.editTrainer(trainerdetails, trainerId);
          return editedTrainer;
     }

     async deleteTrainer(trainerid: ObjectId):Promise<Trainer> {
           const isTrainerExist = await this.trainerService.findOneById(trainerid);
           if(!isTrainerExist){
               throw new NotFoundException("Trainer not found.");
           }
           const removeTrainer = await this.trainerService.deleteTrainer(trainerid);
           return removeTrainer;
     }

     async getAllTrainers(status: string | undefined):Promise<Trainer[]> {
           const trainers = await this.trainerService.getAllTrainer(status);
           if(!trainers) {
               throw new NotFoundException("Trainers not found.");
           }else if (trainers.length === 0) {
                throw new NotFoundException("Trainers not found.");
           }
           return trainers;
     }

     
}
