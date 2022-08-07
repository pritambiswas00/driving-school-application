import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { trimEnd } from "lodash";
import { ObjectId } from "mongodb";
import { Model, Types } from "mongoose";
import { scheduled } from "rxjs";
import { CreateSchedule, ScheduleStatus, ScheduleStatusChange, UpdateSchedule } from "src/Dtos/schedule.dtos";
import { Schedule, ScheduleDocument } from 'src/Entity/schedule.model';
import { ScheduleEventTypes, ScheduleStatusUpdateEvent, ScheduleTrainerUpdateEvent } from "src/Events/Emit/Schedule.emit";
import { TrainerService } from "./trainer.service";

@Injectable()
export class ScheduleService{
     constructor(@InjectModel(Schedule.name) private readonly scheduleModel: Model<ScheduleDocument>, private readonly trainerService:TrainerService, private eventEmitter:EventEmitter2){}


     async create(schedule: CreateSchedule, name: String, startDate:String, endDate: String, phonenumber: String, userid: ObjectId) {
             const newSchedule = new this.scheduleModel({
                 ...schedule,
                 userid: userid,
                 user: {
                    name: name,
                    phonenumber: phonenumber,
                    startDate: startDate,
                    endDate: endDate
                 }
             });
             await newSchedule.save();
             return newSchedule;
     }

     async updateSchedule(updateschedule: UpdateSchedule, scheduleid:ObjectId) {
          const schedule = await this.scheduleModel.findOne({ _id: new Types.ObjectId(scheduleid)});
          let newDate:Date;
          const updateKeys = Object.keys(updateschedule);
          for (let i = 0; i < updateKeys.length; i++) {
              switch (updateKeys[i]) {
                  case "schedulename":
                  case "scheduledate":
                  case "scheduletime":
                    schedule[updateKeys[i]] = updateschedule[updateKeys[i]];
                        break
                  case "status":
                    schedule[updateKeys[i]] = updateschedule[updateKeys[i]];
                    if(updateschedule[updateKeys[i]] === ScheduleStatus.COMPLETED || updateschedule[updateKeys[i]] === ScheduleStatus.CANCELLED) {
                         await this.eventEmitter.emitAsync(ScheduleEventTypes.SCHEDULE_STATUS_UPDATE, new ScheduleStatusUpdateEvent(schedule.trainerdetails.email.toString(), schedule.trainerdetails.phonenumber.toString(), schedule._id, ScheduleStatus.PENDING, schedule.scheduledate, schedule.scheduletime));
                    }
                        break;
                  case "trainerdetails":
                      const trainer = await this.trainerService.findTrainerAvailableForUser(updateschedule[updateKeys[i]].email, updateschedule[updateKeys[i]].phonenumber, schedule.scheduledate, schedule.scheduletime);
                      await this.eventEmitter.emitAsync(ScheduleEventTypes.SCHEDULE_TRAINER_UPDATE_EVENT, new ScheduleTrainerUpdateEvent({ newtraineremail: trainer.email, newtrainerphonenumber: trainer.phonenumber}, { email: schedule[updateKeys[i]].email, phonenumber: schedule[updateKeys[i]].phonenumber}, scheduleid));
                      schedule[updateKeys[i]] = updateschedule[updateKeys[i]];
                      newDate = new Date();
                      schedule[updateKeys[i]]["updatedAt"] = newDate;
                        break;
                  default:
                      break;    
              }
          }
           newDate = new Date();
          schedule["updatedAt"] = newDate;
          await schedule.save();
          return schedule;
     }

     async findScheduleBasedOnDateAndUserId(date: string, userid: ObjectId){
          const schedule = await this.scheduleModel.findOne({scheduledate: { $eq: date }, userid: { $eq : new Types.ObjectId(userid)}});
          if(schedule) {
               throw new NotFoundException(`Schedule with date ${date} already scheduled.`);
          }
          return schedule;
     }

     async findScheduleBasedOnId(scheduleid: ObjectId) {
         const schedule = await this.scheduleModel.findOne({ _id: new Types.ObjectId(scheduleid)});
         return schedule;
     }

     async findScheduleBasedOnScheduleIdAndUserId(scheduleid:ObjectId , userid : ObjectId):Promise<Schedule>{
          const schedule = await this.scheduleModel.findOne({_id: {$eq : new Types.ObjectId(scheduleid)}, userid: { $eq :  new Types.ObjectId(userid)}});
          if(!schedule) {
               throw new NotFoundException(`Schedule with id ${scheduleid} not found.`);
          }
          return schedule;
     }


     async deleteSchedule(id:ObjectId){
         const isSchduleExist = await this.scheduleModel.findOneAndDelete({
          _id: id
         });
         return isSchduleExist;
     }

     async getAllSchdulesByUserid(userid: ObjectId, queryStatus:string|undefined):Promise<Schedule[]>{
          let allSchedules:Schedule[];
          console.log(userid, queryStatus);
          if(queryStatus) {
               allSchedules = await this.scheduleModel.find({
                    userid: new Types.ObjectId(userid),
                    status:queryStatus.toUpperCase()
              });
          }else{
               allSchedules = await this.scheduleModel.find({ userid: new Types.ObjectId(userid)});
          }
          return allSchedules;
     }

     async getAllSchdulesForAdmin(userId: ObjectId| undefined, queryStatus: string | undefined) :Promise<Schedule[]>{
               let allSchedules:Schedule[];

               if(userId && queryStatus) {
                   allSchedules = await this.scheduleModel.find({
                      userid: { $eq : userId },
                      status : { $eq : queryStatus.toUpperCase()}
                   })
               }else if(userId && !queryStatus) {
                    allSchedules = await this.scheduleModel.find({userid: { $eq : userId}});
               }else if(!userId && queryStatus) {
                    allSchedules = await this.scheduleModel.find({
                         status : { $eq : queryStatus.toUpperCase() }
                    })
               }else {
                    allSchedules = await this.scheduleModel.find();
               }
               return allSchedules;
     }
}



