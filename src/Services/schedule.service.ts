import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";
import { CreateSchedule } from "src/Dtos/schedule.dtos";
import { Schedule, ScheduleDocument } from 'src/Entity/schedule.model';
import { User } from "src/Entity/user.model";

@Injectable()
export class ScheduleService{
     constructor(@InjectModel(Schedule.name) private readonly scheduleModel: Model<ScheduleDocument>){}


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
         return isSchduleExist;
     }

     async getAllSchdulesByUserid(userid: ObjectId|string, queryStatus:string|undefined):Promise<Schedule[]>{
          let allSchedules:Schedule[];
          console.log(userid, queryStatus);
          if(queryStatus) {
               allSchedules = await this.scheduleModel.find({
                    userid: userid,
                    status:queryStatus.toUpperCase()
              });
          }else{
               allSchedules = await this.scheduleModel.find({ userid: userid });
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



