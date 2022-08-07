import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/Entity/user.model';
import { UserEventTypes } from '../Emit/User.emit';

@Injectable()
export class UserCreatedEvent {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,private readonly mailerService:MailerService, private readonly configService:ConfigService, private readonly lazyModuleLoader: LazyModuleLoader){}

@OnEvent(UserEventTypes.NEW_USER_CREATED, { async: true })
async welcomeNewUser(payload:User) {
    await this.mailerService.sendMail({
        to: payload.email.toString(),
        subject: 'Greeting from Driving School',
        template: './email.hbs',
        context: {
            office_email_address: this.configService.get<string>('SMTP_USERNAME'),
            office_phone_number: this.configService.get<string>('SMTP_PASSWORD') || 8017393446,
            user_name: payload.name,
        }
    })
   };

@OnEvent(UserEventTypes.USER_SCHEDULE_UPDATE, { async: true })
async onUserAllowScheduleUpdate(payload: ObjectId) {
      const response = await this.userModel.findByIdAndUpdate(payload, { $inc: { allowschedule: +1 }});
  }   
}