import {  Injectable } from "@nestjs/common";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from 'util';
const scrypt = promisify(_scrypt);


@Injectable()
export class UtilService {
    constructor(){}


    async hashPassword(password: string): Promise<string> {

        const salt = randomBytes(8).toString("hex");
        const hashPassword = (await scrypt(password, salt, 16)) as Buffer;
        return `${salt}.${hashPassword.toString("hex")}`
    }

    async comparePassword(password:string, hashedPassword:String): Promise<boolean> {
           const [salt, storedHash] = hashedPassword.split(".");
           const newHash = (await scrypt(password,salt, 16)) as Buffer
           if(newHash.toString("hex") !== storedHash)return false;
           return true;
    }

   convertToUnix (date: Date) {
      console.log(date.getTime(), "Time")
      const unixDate = parseInt((date.getTime() / 1000).toFixed(0));
      return unixDate;
   }

   changeDateFormat(date:String) {
        const  newDate = date.split("/");
        let M:any;
        if(newDate[1].includes("0")){
            M = newDate[1].replace("0", "");
            M = +M + 1;
            return `${newDate[0]}/0${M}/${newDate[2]}`
        }else{
            M = +newDate[1]+1;
            return `${newDate[0]}/${M}/${newDate[2]}`
        }    
   }


}