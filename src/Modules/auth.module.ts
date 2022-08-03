import { Module } from '@nestjs/common';
import { AuthController } from '../Controllers/auth.controller';
import { AuthService } from '../Services/auth.service';
import { MongooseModule } from "@nestjs/mongoose"
import { UserSchema, User } from '../Entity/user.model'; 
import { UserService } from '../Services/user.service';
import { UtilService } from 'src/Utils/Utils';
import { Schedule, ScheduleSchema } from 'src/Entity/schedule.model';
import { ScheduleService } from 'src/Services/schedule.service';
import { TrainerService } from 'src/Services/trainer.service';
import { Trainer, TrainerSchema } from 'src/Entity/trainer.model';
import { IsUserInterceptor } from 'src/Interceptors/isUser.interceptor';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CronService } from 'src/Services/auth.cron.service';
import { ScheduleModule } from "@nestjs/schedule";
import { AdminService } from 'src/Services/admin.service';
import { Admin, AdminSchema } from 'src/Entity/admin.model';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';

@Module({
  imports: [MongooseModule.forFeature([{name : User.name, schema : UserSchema}, {name : Schedule.name, schema : ScheduleSchema}, {name : Trainer.name, schema : TrainerSchema}, {name : Admin.name, schema : AdminSchema}]),
  PassportModule.register({
       defaultStrategy: "jwt"
  }),
  JwtModule.registerAsync({
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory: ((config: ConfigService) =>{
          const options:JwtModuleOptions = {
              secret: config.get<string>("JWT_SECRET_AUTH"),
              signOptions: {
                  expiresIn:`${config.get<string>("JWT_EXPIRATION_IN_SECONDS")}s`,
              }
          }
          return options;
    })
 }),
  ScheduleModule.forRoot(),
 ],
  controllers: [AuthController],
  providers: [AuthService, UserService, UtilService, ScheduleService, TrainerService, IsUserInterceptor, JwtService, ConfigService, CronService, AdminService],
  exports:[JwtModule]
})
export class AuthModule {}
