import { ObjectId } from "mongodb";
import { Schedule } from "src/Entity/schedule.model";


export class AdminTrainerAndUserUpdateEvent {
       constructor(public readonly schedule:Schedule) {}
}

export enum AdminEventTypes {
        ADMIN_TRAINER_USER_UPDATE = "ADMIN_TRAINER_USER_UPDATE"
}