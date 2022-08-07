import { Prop,  SchemaFactory, Schema  } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types, } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {
  @Prop({type: ObjectId })
  public _id:ObjectId

  @Prop({ required : true, unique : true, type:String})
  public email: string;

  @Prop({ required : true, unique : true, type:String})
  public phonenumber: string;

  @Prop({ required: false, default: 1234, type:Number })
  public otp: number;

  @Prop({ required: false, default: false, type:Boolean })
  public verification: boolean;

  @Prop({ required: true, max: 10, type:String })
  public password: string;

  @Prop({ required: false, default: [] })
  public tokens : { token : string,
             date : Date
           }[]
  @Prop({ required : false, default : Date.now })
  public createdAt : Date 

  @Prop({ required: false, default : Date.now })
  public updatedAt : Date
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
AdminSchema.pre('save', function(next) {
  const admin = this;
  if(!admin._id){
    admin._id = new Types.ObjectId();
  }
  next();
})
