import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required : true, unique : true, max : 14})
  billnumber : String;

  @Prop({ required : true, unique : true})
  email: String;

  @Prop({ required : true, unique : true })
  phonenumber: String;

  @Prop({ required : true, max: 20 })
  name : String;

  @Prop({ required : true,  })
  startDate : String;

  @Prop({ required : false, default : "" })
  endDate : String;

  @Prop({ required : false, default : false })
  isVerified: Boolean;

  @Prop({ required : false, default : "1234" })
  otp : String;

  @Prop({ required : false, default : Date.now })
  createdAt : Date

  @Prop({ required: false, default : Date.now })
  updatedAt : Date

  @Prop({ required: true, maxlength: 20, trim: true})
  allowschedule: String

  @Prop({ required : false, default: []})
  tokens : { token : String,
             date : Date
           }[]
}

export const UserSchema = SchemaFactory.createForClass(User);
