import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type CarDocument = Car & Document;

@Schema()
export class Car {
  @Prop({ type: String, required : true, max: 20})
  vin: string;

  @Prop({type: String, required : true, max:20})
  make: string;

  @Prop({ type : String, required : true, max: 20})
  model : string;

  @Prop({ required: false, default : Date.now })
  updatedAt : Date

  @Prop({ required : false, default : Date.now })
  createdAt : Date
}

export const CarSchema = SchemaFactory.createForClass(Car);