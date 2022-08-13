import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LazyModuleLoader } from "@nestjs/core";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Model, Types} from "mongoose";
import { ScheduleStatus } from "src/Dtos/schedule.dtos";
import { TrainerCreate, TrainerStatus, TrainerUpdate } from "src/Dtos/trainer.dto";
import { Trainer, TrainerDocument } from "src/Entity/trainer.model";
import { TrainerEmailPayload, TrainerEventNames } from "src/Events/Emit/trainer.emit";
import { UtilService } from "src/Utils/Utils";


@Injectable()
export class TrainerService{
    constructor(@InjectModel(Trainer.name) private readonly trainerModel: Model<TrainerDocument>, private readonly configService: ConfigService, private readonly utilService: UtilService, private readonly lazyModuleLoader: LazyModuleLoader, private readonly eventEmitter: EventEmitter2){}

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
         const trainer = await this.trainerModel.findByIdAndDelete(new Types.ObjectId(trainerid));
         return trainer;
    }

    async getAllTrainer(status: string|undefined):Promise<Trainer[]> {
        let trainers:Trainer[]; 
        if(status){
          trainers = await this.trainerModel.find({ status: {$eq : status.toUpperCase()}});
          return trainers;
        }
        trainers = await this.trainerModel.find({});
        return trainers;
    }
    
    async findTrainerBasedOnEmailAndPhone(email: string, phonenumber: string):Promise<Trainer> {
               const trainer = await this.trainerModel.findOne({ email: {$eq : email}, phonenumber: { $eq: phonenumber} });
               return trainer;
    }

    async findOneById(id: ObjectId):Promise<Trainer> {
        const trainer = await this.trainerModel.findOne({ _id: new Types.ObjectId(id)});
        return trainer;
    }

    async editTrainer(trainer: TrainerUpdate, trainerid: ObjectId):Promise<Trainer>{
        const trainerexist = await this.trainerModel.findOne({ _id: new Types.ObjectId(trainerid)});
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
           const trainer = await this.trainerModel.findOne({ email: { $eq: traineremail}, status : { $eq :TrainerStatus.ONLINE }, phonenumber: { $eq: trainerphonenumber }});
            if(!trainer) {
                 throw new NotFoundException(`Trainer currently not online.`)
            }
            for(let i = 0;i < trainer.dayScheduleTimeList.length; i++) {
                if(trainer.dayScheduleTimeList[i].scheduledate === scheduledate && trainer.dayScheduleTimeList[i].scheduletime === scheduletime) {
                    throw new ServiceUnavailableException(`Trainer is already book for date ${scheduledate} and time ${scheduletime}`);
                }
            }
            return trainer;
    }

    async addNewScheduleToTrainer(email:string,phonenumber:string,scheduleid:ObjectId, scheduledate:string, scheduletime:string, status: string):Promise<Trainer> {
           const date = new Date();
           const trainer = await this.trainerModel.findOneAndUpdate({ email: { $eq: email }, phonenumber: {$eq: phonenumber }, status: TrainerStatus.ONLINE}, {
               $push: {
                    "dayScheduleTimeList": {
                       scheduleid: scheduleid,
                       scheduledate: scheduledate,
                       scheduletime: scheduletime,
                       status: status,  
                    }
               },
               $set : { updatedAt: date }
           });
           await this.eventEmitter.emitAsync(TrainerEventNames.TRAINER_ALLOTMENT, new TrainerEmailPayload(email, phonenumber, scheduledate, scheduletime, status));
           return trainer;
    }

    async deleteTrainerBooking(traineremail:String, trainerphonenumber :String, scheduleid:ObjectId, scheduletime:string, scheduledate:string, status :string ):Promise<void> {
            await this.trainerModel.updateOne({ email: { $eq: traineremail}, phonenumber: { $eq: trainerphonenumber }}, {
                   $pull : {
                       dayScheduleTimeList: {
                           scheduleid: new Types.ObjectId(scheduleid),
                           status: status.toUpperCase(),
                           scheduledate: scheduledate,
                           scheduletime: scheduletime
                       }
                   }
            });
    }
}
