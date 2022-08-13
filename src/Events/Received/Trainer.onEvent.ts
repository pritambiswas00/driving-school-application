import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { TrainerService } from 'src/Services/trainer.service';
import { TrainerEmailPayload, TrainerEventNames } from '../Emit/trainer.emit';

@Injectable()
export class NewTrainerAllotmentEvent {
    constructor(private readonly mailerService:MailerService, private readonly configService:ConfigService, private readonly lazyModuleLoader: LazyModuleLoader, private readonly trainerService:TrainerService){}

    @OnEvent(TrainerEventNames.TRAINER_ALLOTMENT, { async: true })
    async welcomeNewUser(payload:TrainerEmailPayload) {
    await this.mailerService.sendMail({
        from: this.configService.get<string>('SMTP_USERNAME'),
        to: payload.email,
        subject: 'Trainer Booked.',
        template: './trainer_allotment.hbs',
        context: {
            office_email_address: this.configService.get<string>('SMTP_USERNAME'),
            office_phone_number: this.configService.get<string>('OFFICIAL_PHONE_NUMBER') || 123456789,
            schedule_time: payload.scheduletime,
            schedule_date: payload.scheduledate,
            trainer_email_address: payload.email
        }
       })
   };
}