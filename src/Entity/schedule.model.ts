import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { TrainerCreate } from 'src/Dtos/trainer.dto';

export type ScheduleDocument = Schedule & Document;
enum ScheduleStatus {
  COMPLETED = "COMPLETED", //or User = "user",
  PENDING = "PENDING", // or Admin = "admin",
}
@Schema()
export class Schedule {

  @Prop({ type: ObjectId })
  _id: ObjectId
  
  @Prop({ required : true, max: 20})
  schedulename: string;

  @Prop({ required : true,})
  scheduledate: string;

  @Prop({ required : false})
  scheduletime: string;

  @Prop({ type: TrainerCreate, required : true })
  trainerdetails: {
        email : {
           type: String,
           required: true,
      },
        phonenumber : {
           type: String,
           required: true,
      },
        trainername : {
           type: String,
           required: true,
           max: 20
      },
        carddetails : {
           model: String,
           make : String,
           vin : String
      },
      updatedAt: Date,
  };

  @Prop({ required: true, type : ObjectId })
  userid : ObjectId

  @Prop({ required: true, type: { name: String, phonenumber: String, startDate: String, endDate: String }})
  user: { name: string, phonenumber:string, startDate: string, endDate: string}

  @Prop({ required : false, default : Date.now })
  createdAt : Date

  @Prop({ required : false, default : Date.now })
  updatedAt : Date

  @Prop({ type: String, required : false, default : "PENDING", enum:["PENDING", "COMPLETED", "CANCELED"]})
  status : string
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
ScheduleSchema.pre('save', function(next) {
  const schedule = this;
  if(!schedule._id){
    schedule._id = new Types.ObjectId();
  }
  next();
})