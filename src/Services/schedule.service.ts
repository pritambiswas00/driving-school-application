import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";
import { CreateSchedule } from "src/Dtos/schedule.dtos";
import { Schedule, ScheduleDocument } from 'src/Entity/schedule.model';

@Injectable()
export class ScheduleService{
     constructor(@InjectModel(Schedule.name) private readonly scheduleModel: Model<ScheduleDocument>){}


     async create(schedule: CreateSchedule, id: ObjectId | string) {
             const newSchedule = new this.scheduleModel({
                 ...schedule,
                 userid: id
             });
             await newSchedule.save();
             return newSchedule;
     }

     async findScheduleBasedOnDateAndUserId(date: string, userid: ObjectId | string){
          const schedule = await this.scheduleModel.findOne({scheduledate: { $eq: date }, userid: { $eq : userid }});
          return schedule;
     }

     async findScheduleBasedOnId(scheduleid: ObjectId) {
         const schedule = await this.scheduleModel.findOne({ _id: scheduleid });
         return schedule;
     }

     async findScheduleBasedOnScheduleIdAndUserId(scheduleid:ObjectId , userid : ObjectId) {
          const schedule = await this.scheduleModel.findOne({_id: {$eq : scheduleid}, userid: { $eq :  userid}});
          return schedule;
     }


     async deleteSchedule(id:ObjectId){
         const isSchduleExist = await this.scheduleModel.findOneAndDelete({
          _id: id
         });
         if(!isSchduleExist) return null;
         return isSchduleExist;
     }

     async getAllSchdulesByUserid(userid: ObjectId|string|undefined, queryStatus:string|undefined):Promise<Schedule[]>{
          let allSchedules:Schedule[];
          if(queryStatus && userid){
               allSchedules = await this.scheduleModel.find({
                    userid: userid,
                    status:queryStatus.toUpperCase()
              });
              return allSchedules;
          }else if(!queryStatus && userid){
                allSchedules = await this.scheduleModel.find({ userid: userid });
                return allSchedules;
          }else if(queryStatus && !userid){
                allSchedules = await this.scheduleModel.find({ status:queryStatus.toUpperCase() });
                return allSchedules;
          }else{
                    allSchedules = await this.scheduleModel.find();
                    return allSchedules;
          }
     }
}



