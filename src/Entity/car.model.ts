import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type CarDocument = Car & Document;

@Schema()
export class Car {
  @Prop({ type: String, required : true, max: 20, unique: true})
  public vin: string;

  @Prop({type: String, required : true, max:20})
  public make: string;

  @Prop({ type : String, required : true, max: 20})
  public model : string;

  @Prop({ required: false, default : Date.now })
  public updatedAt : Date

  @Prop({ required : false, default : Date.now })
  public createdAt : Date
}

export const CarSchema = SchemaFactory.createForClass(Car);