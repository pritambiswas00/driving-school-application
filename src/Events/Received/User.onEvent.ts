import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/Entity/user.model';
import { UserEventTypes } from '../Emit/User.emit';

@Injectable()
export class UserCreatedEvent {
    constructor(private readonly mailerService:MailerService, private readonly configService:ConfigService){}

@OnEvent(UserEventTypes.NEW_USER_CREATED, { async: true })
async welcomeNewUser(payload:User) {
    await this.mailerService.sendMail({
        to: payload.email.toString(),
        subject: 'Greeting from Driving School',
        template: './email.hbs',
        context: {
            SMTP_USERNAME: this.configService.get<string>('SMTP_USERNAME')
        }
    })
   };
}