import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;
enum ScheduleStatus {
  COMPLETED = "COMPLETED", //or User = "user",
  PENDING = "PENDING", // or Admin = "admin",
}
@Schema()
export class Schedule {
  @Prop({ required : true, max: 20})
  schedulename: string;

  @Prop({ required : true,})
  scheduledate: string;

  @Prop({ required : false})
  scheduletime: string;

  @Prop({ type: Object, required : true })
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
      }
  };

  @Prop({ required: true, type : ObjectId })
  userid : ObjectId

  @Prop({ required : false, default : Date.now })
  createdAt : Date

  @Prop({ required : false, default : Date.now })
  updatedAt : Date

  @Prop({ type: String, required : false, default : "PENDING"})
  status : string
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);