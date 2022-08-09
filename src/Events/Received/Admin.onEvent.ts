import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { ScheduleStatus } from 'src/Dtos/schedule.dtos';
import { ScheduleService } from 'src/Services/schedule.service';
import { TrainerService } from 'src/Services/trainer.service';
import { UserService } from 'src/Services/user.service';
import { AdminEventTypes, AdminTrainerAndUserUpdateEvent } from '../Emit/Admin.emit';


@Injectable()
export class AdminTrainerAndUserUpdateOnEvent {
    constructor(private readonly configService:ConfigService, private readonly scheduleService: ScheduleService, private trainerService:TrainerService, private readonly lazyModuleLoader: LazyModuleLoader,private readonly userService:UserService ){}

   @OnEvent(AdminEventTypes.ADMIN_TRAINER_USER_UPDATE, { async: true })
   async updateTrainerReqAndUserScheduleAllotment(payload: AdminTrainerAndUserUpdateEvent) {
    await this.userService.updateUserScheduleAllotment(payload.schedule.userid, "INC");
    await this.trainerService.deleteTrainerBooking(payload.schedule.trainerdetails.email.toString(), payload.schedule.trainerdetails.phonenumber.toString(), payload.schedule._id, payload.schedule.scheduletime, payload.schedule.scheduledate, ScheduleStatus.PENDING);
   }
}