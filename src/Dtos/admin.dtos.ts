import { ApiProperty} from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty, IsAlphanumeric, IsOptional, Matches, IsBoolean, MaxLength, IsNumber, IsMongoId } from "class-validator";
import { ObjectId } from "mongodb";
export class AddAdmin {

    @ApiProperty({ required : true })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email: string;

    @ApiProperty({ required : true })
    @Matches(/^[6-9]\d{9}$/i, { message:"Phone number must be 10 digits." })
    @IsString()
    @IsNotEmpty()
    public phonenumber: string;

    
    @ApiProperty({ required : true })
    @MaxLength(10, { message: "Max length must be equal to 10 characters." })
    @IsString()
    @IsNotEmpty()
    public password : string;
}

export class Login {
    @ApiProperty({ required : true })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email: string;
    
    @ApiProperty({ required : true })
    @IsString()
    @IsNotEmpty()
    public password : string;
}

export class CreateUser {
    @ApiProperty({ required : true})
    @IsAlphanumeric()
    @IsString()
    @IsNotEmpty()
    public billnumber : string;

    @ApiProperty({ required : true })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email : string;
    
    @ApiProperty({ required : true })
    @Matches(/^[6-9]\d{9}$/i, { message:"Phone number must be 10 digits."})
    @IsString()
    @IsNotEmpty()
    public phonenumber : string;

    @ApiProperty({ required : true })
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    public name : string;

    @ApiProperty({ required : true })
    @Matches(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(20)\d{2}$/, {message : "Date must be DD/MM/YYYY"})
    @IsString()
    @IsNotEmpty()
    public startDate : string;
 
    @ApiProperty({ required : false })
    @Matches(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(20)\d{2}$/, {message : "Date must be DD/MM/YYYY"})
    @IsString()
    @IsOptional()
    public endDate? : string;

    @ApiProperty({ required : true })
    @MaxLength(2)
    @IsString()
    @IsNotEmpty()
    public allowschedule: string
}


export class UpdateUser {
    @ApiProperty({ required : false })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    public email ?: string;

    @ApiProperty({ required : false })
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    @IsOptional()
    public name ?: string;

    @ApiProperty({ required : false })
    @Matches(/^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(20)\d{2}$/, {message : "Date must be DD/MM/YYYY"})
    @IsString()
    @IsOptional()
    public endDate? : string;

    @ApiProperty({ required : false })
    @MaxLength(2)
    @IsString()
    @IsOptional()
    public allowschedule?: string;
}


export class TrainerStatus{
    @ApiProperty({ required : true, type: ObjectId })
    @IsMongoId()
    @IsNotEmpty()
    public trainerid: ObjectId

    @ApiProperty({ required : true, type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    public status: boolean
     static ONLINE: any;
}

export class AdminPayload {
      @IsMongoId()
      @IsNotEmpty()
      adminId:string;

      @IsEmail()
      @IsString()
      @IsNotEmpty()
      email: string;

      @IsNumber()
      @IsNotEmpty()
      iat: number;
}
