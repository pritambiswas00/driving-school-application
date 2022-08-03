import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsObject, IsOptional, IsPhoneNumber, IsEmail, Matches, MaxLength, IsEnum } from "class-validator";

export class Car {

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty() 
    public make : string;
 
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    public model : string;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    public vin : string;
}

export enum TrainerStatus {
     ONLINE = "ONLINE",
     OFFLINE = "OFFLINE"
}

export class TrainerCreate {
    @ApiProperty({ required: true })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email : string;

    @ApiProperty({ required: true })
    @Matches(/^[6-9]\d{9}$/i, { message:"Phone number must be 10 digits."})
    @IsString()
    @IsNotEmpty()
    public phonenumber : string;
    
    @ApiProperty({ required: true })
    @MaxLength(20, { message: "Trainer name must be 1 to 20 characters."})
    @IsString()
    @IsNotEmpty()
    public trainername : string;
    
    @ApiProperty({ required: true, type : Car })
    @IsObject()
    @IsNotEmpty()
    public cardetails : Car
}

export class TrainerUpdate {
    @ApiProperty({ required: false })
    @IsEmail()
    @IsString()
    @IsOptional()
    public email?: string;
    
    @ApiProperty({ required: false })
    @MaxLength(20, { message: "Trainer name must be 1 to 20 characters."})
    @IsString()
    @IsOptional()
    public trainername ?: string;
    
    @ApiProperty({ required: false, type : String })
    @IsString()
    @IsOptional()
    public make ?: string;

    @ApiProperty({ required: false, type : String })
    @IsString()
    @IsOptional()
    public model ?: string;

    @ApiProperty({ required: false, type : String })
    @IsString()
    @IsOptional()
    public vin ?: string;

    @ApiProperty({
        required: false,
        enum: TrainerStatus,
        isArray: true,
    })
    @IsEnum(TrainerStatus)
    @IsOptional()
    public status: TrainerStatus;
}



