import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';


export type CarDocument = Car & Document;

@Schema()
export class Car {
  @Prop({ type: ObjectId})
  public _id: ObjectId

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
CarSchema.pre('save', function(next) {
  const car = this;
  if(!car._id){
    car._id = new Types.ObjectId();
  }
  next();
})