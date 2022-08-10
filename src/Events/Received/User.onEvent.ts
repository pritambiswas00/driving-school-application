import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ScheduleStatus } from 'src/Dtos/schedule.dtos';
import { Schedule } from 'src/Entity/schedule.model';
import { User, UserDocument } from 'src/Entity/user.model';
import { TrainerService } from 'src/Services/trainer.service';
import { UserEventTypes } from '../Emit/User.emit';

@Injectable()
export class UserCreatedEvent {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,private readonly mailerService:MailerService, private readonly configService:ConfigService, private readonly lazyModuleLoader: LazyModuleLoader, private readonly trainerService:TrainerService){}

@OnEvent(UserEventTypes.NEW_USER_CREATED, { async: true })
async welcomeNewUser(payload:User) {
    await this.mailerService.sendMail({
        from: this.configService.get<string>('SMTP_USERNAME'),
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
async onUserAllowScheduleUpdate(payload: Schedule) {
      await this.userModel.findByIdAndUpdate(new Types.ObjectId(payload.userid), { $inc: { allowschedule: +1 }});
      await this.trainerService.deleteTrainerBooking(payload.trainerdetails.email.toString(), payload.trainerdetails.phonenumber.toString(), payload._id, payload.scheduletime, payload.scheduledate, ScheduleStatus.PENDING);
  }   
}