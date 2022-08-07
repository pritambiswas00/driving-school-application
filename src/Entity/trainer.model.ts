import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { Car } from './car.model';


export type TrainerDocument = Trainer & Document;

@Schema()
export class Trainer  {
  @Prop({ type: Types.ObjectId})
  public _id: ObjectId

  @Prop({ type: String, required : true})
  public email: string;

  @Prop({type: String, required : true, unique: true})
  public phonenumber: string;

  @Prop({ type : String, required : true, max: 20})
  public trainername : string;

  @Prop({ type: Car, required : true })
  public cardetails: { model: String, make : String, vin: String};

  @Prop({ type: [], required : false, default: [] })
  public leavedetails: { leavereason: string, date : string}[];

  @Prop({ type: String, required : false, default: "OFFLINE", enum: ["OFFLINE", "ONLINE"] })
  public status: string

  @Prop({ required: false, default : Date.now })
  public updatedAt : Date

  @Prop({ required : false, default : Date.now })
  public createdAt : Date

  @Prop({ required : false, default :  []})
  public dayScheduleTimeList: [
        {
                scheduleid:ObjectId,
                status: string,
                scheduledate: string,
                scheduletime : string
        }
  ]
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);
TrainerSchema.pre('save', function(next) {
  const trainer = this;
  if(!trainer._id){
    trainer._id = new Types.ObjectId();
  }
  next();
})

