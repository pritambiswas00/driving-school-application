import { Injectable } from "@nestjs/common"; 
import { ConfigService } from "@nestjs/config";
import { createTransport } from "nodemailer";

@Injectable()
export class MailerService {
      constructor(private readonly configService:ConfigService){};

      async createTransport() {
           return createTransport({
               host: this.configService.get<string>("SMTP_HOST"),
               port: this.configService.get<number>("SMTP_PORT"),
               auth: {
                  user: this.configService.get<string>("SMTP_USERNAME"),
                  pass: this.configService.get<string>("SMTP_PASSWORD"),
               }
           })
      }

      
}