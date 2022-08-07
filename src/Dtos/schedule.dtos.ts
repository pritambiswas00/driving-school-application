import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, Matches, IsObject, MaxLength, IsEnum } from "class-validator";
import { TrainerCreate, TrainerUpdate } from "./trainer.dto";

export enum ScheduleStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED"
}
export class UpdateSchedule {

    @ApiProperty({ required: false })
    @MaxLength(20, { message: "Schedule name must be 1 to 20 characters." })
    @IsString()
    @IsOptional()
    schedulename?: string;
    
    @ApiProperty({ required: false })
    @Matches(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(20)\d{2}$/, {message : "Date must be DD/MM/YYYY"})
    @IsString()
    @IsOptional()
    scheduledate? : string;
    
    @ApiProperty({ required: false })
    @Matches(/^(0?[1-9]|1[0-2]):([0-5]0)\s?((?:A|P)\.?M\.?)\s?-\s?(0?[1-9]|1[0-2]):([0-5]0)\s?((?:A|P)\.?M\.?)$/ig, {message : "Time must be HH:00am/pm-HH:00am/pm (12 Hours Format)"})
    @IsString()
    @IsOptional()
    scheduletime? : string;
    

    @ApiProperty({ required: false, type : TrainerCreate})
    @IsObject()
    @IsOptional()
    trainerdetails?: TrainerCreate
    
    @ApiProperty({
        enum: ScheduleStatus,
        isArray: true,
        required: false
    })
    @IsEnum(ScheduleStatus)
    @IsOptional()
    public status?: ScheduleStatus;
}


export class CreateSchedule {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    schedulename: string;
    
    @ApiProperty({ required: true })
    @Matches(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(20)\d{2}$/, {message : "Date must be DD/MM/YYYY"})
    @IsString()
    @IsNotEmpty()
    scheduledate : string;
    
    @ApiProperty({ required: true })
    @Matches(/^(0?[1-9]|1[0-2]):([0-5]0)\s?((?:A|P)\.?M\.?)\s?-\s?(0?[1-9]|1[0-2]):([0-5]0)\s?((?:A|P)\.?M\.?)$/i, {message : "Time must be HH:00am/pm-HH:00am/pm (12 Hours Format)"})
    @IsString()
    @IsNotEmpty()
    scheduletime : string;
    

    @ApiProperty({ required: true, type : TrainerCreate})
    @IsObject()
    @IsNotEmpty()
    trainerdetails: TrainerCreate
}

export class ScheduleStatusChange {
    @ApiProperty({
        enum: ["COMPLETED", "CANCELLED"],
        isArray: true,
        required: true
    })
    @IsEnum(["COMPLETED", "CANCELLED"])
    @IsNotEmpty()
    public status: ["COMPLETED", "CANCELLED"];
}