import { IsEmail, IsString, IsNotEmpty, IsObject, IsMongoId, Matches, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class LoginUser {
    
    @ApiProperty({ required : true })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email : string;
    

    @ApiProperty({ required : true })
    @Matches(/^[6-9]\d{9}$/i, { message:"Phone number must be 10 digits." })
    @IsString()
    @IsNotEmpty()
    phonenumber: string;

}

export class UserPayload {
      
    @IsMongoId()
    @IsNotEmpty()
    userId:string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    iat: number;
}


















