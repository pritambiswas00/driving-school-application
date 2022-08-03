import { Module } from '@nestjs/common';
import { AdminController } from '../Controllers/admin.controller';
import { AdminService } from '../Services/admin.service';
import { UserService } from '../Services/user.service';
import { UtilService } from 'src/Utils/Utils';
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from 'src/Entity/admin.model';
import { User, UserSchema } from 'src/Entity/user.model';
import { IsAdminInterceptor } from 'src/Interceptors/isAdmin.interceptor';
import { Schedule, ScheduleSchema } from 'src/Entity/schedule.model';
import { ScheduleService } from 'src/Services/schedule.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Trainer, TrainerSchema } from 'src/Entity/trainer.model';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from "@nestjs/schedule"
import { TrainerService } from 'src/Services/trainer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [MongooseModule.forFeature([{name : Admin.name, schema : AdminSchema}, {name : User.name, schema : UserSchema}, {name : Schedule.name, schema : ScheduleSchema}, {name : Trainer.name, schema : TrainerSchema}]),
  PassportModule.register({
      defaultStrategy: "jwt"
  }),
  JwtModule.registerAsync({
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory: ((config: ConfigService) =>{
          const options:JwtModuleOptions = {
              secret: config.get("JWT_SECRET_ADMIN"),
              signOptions: {
                  expiresIn: `${config.get<string>("JWT_EXPIRATION_IN_SECONDS")}s`,
              }
          }
          return options;
    })
}),
  
],
  controllers: [AdminController],
  providers: [AdminService, UserService, UtilService, IsAdminInterceptor, ScheduleService, ConfigService, JwtService, TrainerService],
})
export class AdminModule {}
