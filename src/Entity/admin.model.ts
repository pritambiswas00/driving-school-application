import { Prop,  SchemaFactory, Schema  } from '@nestjs/mongoose';
import { Document} from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {

  @Prop({ required : true, unique : true})
  email: String;

  @Prop({ required : true, unique : true})
  phonenumber: String;

  @Prop({ required: false, default: 1234 })
  otp: Number;

  @Prop({ required: false, default: false })
  verification: Boolean;

  @Prop({ required: true, max: 10})
  password: String;

  @Prop({ required: false, default: [] })
  tokens : { token : String,
             date : Date
           }[]
  @Prop({ required : false, default : Date.now })
  createdAt : Date 

  @Prop({ required: false, default : Date.now })
  updatedAt : Date
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
