import { ObjectId } from "mongodb";


export class ScheduleTrainerUpdateEvent {
       constructor(public readonly newtrainer: { newtraineremail:string, newtrainerphonenumber:string }, public readonly previoustrainer:{ email:string, phonenumber:string }, public readonly scheduleid: ObjectId) {}
}

export class ScheduleStatusUpdateEvent {
        constructor(public readonly traineremail:string, public readonly newtrainerphonenumber:string, public readonly scheduleid: ObjectId, public readonly status: string, public readonly scheduledate: string, public readonly scheduletime: string){}
}

export enum ScheduleEventTypes {
        SCHEDULE_TRAINER_UPDATE_EVENT = "SCHEDULE_TRAINER_UPDATE_EVENT",
        SCHEDULE_STATUS_UPDATE = "SCHEDULE_STATUS_UPDATE"
}