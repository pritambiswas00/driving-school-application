import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Model} from "mongoose";
import { ScheduleStatus } from "src/Dtos/schedule.dtos";
import { TrainerCreate, TrainerStatus, TrainerUpdate } from "src/Dtos/trainer.dto";
import { Trainer, TrainerDocument } from "src/Entity/trainer.model";
import { UtilService } from "src/Utils/Utils";


@Injectable()
export class TrainerService{
    constructor(@InjectModel(Trainer.name) private readonly trainerModel: Model<TrainerDocument>, private readonly configService: ConfigService, private readonly utilService: UtilService){}

    async findTrainerBasedOnEmail(email : string) {
         const isTrainerExist = await this.trainerModel.findOne({ email : email });
         if(!isTrainerExist) return null;
         return isTrainerExist;
    }


    async create(trainer: TrainerCreate) {
         try{
               const newTrainer = new this.trainerModel(trainer);
               await newTrainer.save();
               return newTrainer;
         }catch(error) {
           throw new InternalServerErrorException(error)
         }

    }

    async deleteTrainer(trainerid: ObjectId) { 
         const trainer = await this.trainerModel.findByIdAndDelete({
          _id: trainerid
         });
         if(!trainer) return null;
         return trainer;
    }

    async getAllTrainer(status: string|undefined):Promise<Trainer[]> {
        let trainers:Trainer[]; 
        if(status){
          trainers = await this.trainerModel.find({ status: status.toUpperCase() });
          return trainers;
        }
        trainers = await this.trainerModel.find({});
        return trainers;
    }
    
    async findTrainerBasedOnEmailAndPhone(email: string, phonenumber: string):Promise<Trainer> {
            try{
               const trainer = await this.trainerModel.findOne({ email: email, phonenumber: phonenumber });
               if(!trainer) return null;
               return trainer;
            }catch(error){
               throw new InternalServerErrorException(error)
            }
    }

    async findOneById(id: ObjectId):Promise<Trainer> {
        const trainer = await this.trainerModel.findOne({ _id: id });
        return trainer;
    }

    async editTrainer(trainer: TrainerUpdate, id: ObjectId):Promise<Trainer>{
        const trainerexist = await this.trainerModel.findOne({ _id: id });
        if(!trainerexist){
            throw new NotFoundException("Trainer not found.");
        }
        const updatedKeys = Object.keys(trainer);
        for(let i = 0; i < updatedKeys.length; i++) {
             switch(updatedKeys[i]){
                 case "email":
                 case "trainername":
                 case "status":    
                      trainerexist[updatedKeys[i]] = trainer[updatedKeys[i]];
                      break;
                 case "model":
                 case "make" :
                 case "vin"  :  
                      trainerexist.cardetails[updatedKeys[i]] =  trainer[updatedKeys[i]];
                      const newDate:Date = new Date();
                      trainerexist.cardetails["updatedAt"] = newDate;
                      break;           
                 default:
                      break;
             }
        }
        const newDate:Date = new Date();
        trainerexist["updatedAt"] = newDate;
        await trainerexist.save();
        return trainerexist;
    }

    async findTrainerAvailableForUser(traineremail:string, trainerphonenumber:string, scheduletime: string, scheduledate:string):Promise<Trainer> {
           const trainer = await this.trainerModel.findOne({ email: traineremail, status : TrainerStatus.ONLINE, phonenumber: trainerphonenumber});
           if(!trainer) {
               throw new BadRequestException(`Trainer is not available for this moment.`)
           };
           for(let i = 0; i < trainer.dayScheduleTimeList.length; i++) {
                if(trainer.dayScheduleTimeList[i].scheduledate === scheduledate && trainer.dayScheduleTimeList[i].scheduletime === scheduletime && trainer.dayScheduleTimeList[i].status === ScheduleStatus.PENDING) {
                       throw new BadRequestException(`${trainer.trainername} is already booked for this date:${scheduledate} and time:${scheduletime} `)
                }
           }
           return trainer;
    }

    async addNewScheduleToTrainer(traineremail:string,scheduleid:string, scheduledate:string, scheduletime:string, status: string):Promise<void> {
           const trainer = await this.trainerModel.findOneAndUpdate({ email: traineremail, status: TrainerStatus.ONLINE}, {
               $push: {
                    "dayScheduleTimeList": {
                       scheduleid: scheduleid,
                       scheduledate: scheduledate,
                       scheduletime: scheduletime,
                       status: status,  
                    }
               }
           });
           const date = new Date();
           trainer["updatedAt"] = date;
           await trainer.save();
    }
}
