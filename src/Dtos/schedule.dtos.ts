import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, Matches, IsObject, MaxLength, IsEnum } from "class-validator";
import { TrainerCreate, TrainerUpdate } from "./trainer.dto";

export enum ScheduleStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING"
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
    @Matches(/^[0-2][0-2]:[0-5][0-9]$/gm, {message : "Time must be HH:MM"})
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
        example: [ScheduleStatus.COMPLETED, ScheduleStatus.PENDING],
        required: false
    })
    @IsEnum(ScheduleStatus)
    @IsOptional()
    public status?: ScheduleStatus[];
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
    @Matches(/^[0-1][0-2]:[0-5][0-9]$/gm, {message : "Time must be HH:MM (12 Hours)"})
    @IsString()
    @IsNotEmpty()
    scheduletime : string;
    

    @ApiProperty({ required: true, type : TrainerCreate})
    @IsObject()
    @IsNotEmpty()
    trainerdetails: TrainerCreate
}