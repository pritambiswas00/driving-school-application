import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: ObjectId})
  public _id: ObjectId

  @Prop({ required : true, unique : true, max : 14, type:String})
  public billnumber : string;

  @Prop({ required : true, unique : true, type:String})
  public email: string;

  @Prop({ required : true, unique : true, type:String })
  public phonenumber: string;

  @Prop({ required : true, max: 20, type:String })
  public name : string;

  @Prop({ required : true, type:String })
  public startDate : string;

  @Prop({ required : false, default : "" ,type:String})
  public endDate : string;

  @Prop({ required : false, default : false, type:Boolean })
  public isVerified: boolean;

  @Prop({ required : false, default : "1234", type:String })
  public otp : string;

  @Prop({ required : false, default : Date.now })
  public createdAt : Date

  @Prop({ required: false, default : Date.now })
  public updatedAt : Date

  @Prop({ required: true, MAX_VALUE: 20, trim: true, type:Number})
  public allowschedule: number

  @Prop({ required : false, default: []})
  public tokens : { token : string,
             date : Date
           }[]
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', function(next) {
  const user = this;
  if(!user._id){
    user._id = new Types.ObjectId();
  }
  next();
})
