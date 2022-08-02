import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Car } from './car.model';


export type TrainerDocument = Trainer & Document;

@Schema()
export class Trainer {
  @Prop({ type: String, required : true, unique : true})
  email: string;

  @Prop({type: String, required : true, unique: true})
  phonenumber: string;

  @Prop({ type : String, required : true, max: 20})
  trainername : string;

  @Prop({ type: Car, required : true })
  cardetails: { model: String, make : String, vin: String};

  @Prop({ type: [], required : false, default: [] })
  leavedetails: { leavereason: String, date : String}[];

  @Prop({ type: String, required : false, default: "OFFLINE" })
  status: string

  @Prop({ required: false, default : Date.now })
  updatedAt : Date

  @Prop({ required : false, default : Date.now })
  createdAt : Date

  updateTrainer : Function;
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);