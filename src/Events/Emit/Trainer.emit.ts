

export enum TrainerEventNames {
     TRAINER_ALLOTMENT = "TRAINER_ALLOTMENT",
}

export class TrainerEmailPayload {
     constructor(public readonly email:string, public readonly phonenumber:string, public readonly scheduledate: string, public readonly scheduletime:string, public readonly status:string) {}
}