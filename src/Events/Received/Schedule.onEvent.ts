import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { ScheduleStatus } from 'src/Dtos/schedule.dtos';
import { Schedule } from 'src/Entity/schedule.model';
import { ScheduleService } from 'src/Services/schedule.service';
import { TrainerService } from 'src/Services/trainer.service';
import { ScheduleEventTypes, ScheduleStatusUpdateEvent, ScheduleTrainerUpdateEvent } from '../Emit/Schedule.emit';


@Injectable()
export class ScheduleTrainerUpdate {
    constructor(private readonly configService:ConfigService, private readonly scheduleService: ScheduleService, private trainerService:TrainerService, private readonly lazyModuleLoader: LazyModuleLoader){}

   @OnEvent(ScheduleEventTypes.SCHEDULE_TRAINER_UPDATE_EVENT, { async: true })
         async onScheduleTrainerUpdateEvent(payload: ScheduleTrainerUpdateEvent) {
            const { newtrainer, previoustrainer,scheduleid } = payload;
            const schedule = await this.scheduleService.findScheduleBasedOnId(scheduleid);
            if(!schedule) return;
            await this.trainerService.deleteTrainerBooking(previoustrainer.email, previoustrainer.phonenumber, schedule._id, schedule.scheduletime, schedule.scheduledate, schedule.status);
            await this.trainerService.addNewScheduleToTrainer(newtrainer.newtraineremail, newtrainer.newtrainerphonenumber, schedule._id, schedule.scheduletime, schedule.scheduledate, schedule.status);
    }

    @OnEvent(ScheduleEventTypes.SCHEDULE_STATUS_UPDATE, { async: true })
      async onScheduleStatusUpdate(payload: ScheduleStatusUpdateEvent) {
            await this.trainerService.deleteTrainerBooking(payload.traineremail, payload.newtrainerphonenumber, payload.scheduleid, payload.scheduletime, payload.scheduledate, ScheduleStatus.PENDING);
      }
}
