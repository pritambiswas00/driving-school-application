import { Module } from '@nestjs/common';
import * as path from "path";
import * as winston from 'winston';
import { AuthModule } from './Modules/auth.module';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from "./config/configuration";
import { configValidation } from "./config/configValidation";
import { ConnectionModule } from './DBConnection/Connection';
import { AdminModule } from './Modules/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin } from 'mongodb';
import { AdminSchema } from './Entity/admin.model';
import { UtilService } from './Utils/Utils';
import { IsRootInterceptor } from './Interceptors/isRoot.interceptor';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
console.log()
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
       envFilePath: path.join(__dirname, "..",`${process.env.NODE_ENV}.env`),
       isGlobal: true,
       load : [configuration],
       validationSchema : configValidation,
       cache : false
    }),
    ConnectionModule,
    AdminModule,
    ThrottlerModule.forRootAsync({
       imports:[ConfigModule],
       inject:[ConfigService],
       useFactory: ((config: ConfigService) =>{
             const options:ThrottlerModuleOptions = {
                 ttl: +config.get("TTL"),
                 limit: +config.get("RATE_LIMIT")
             }
             return options;
       })
    }),
    MongooseModule.forFeature([{name: Admin.name, schema:AdminSchema}]),
    PassportModule.register({
         defaultStrategy: "jwt",
    }),
    JwtModule.registerAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory: ((config: ConfigService) =>{
              const options:JwtModuleOptions = {
                  secret: config.get<string>("JWT_SECRET_ROOT"),
                  signOptions: {
                      expiresIn: `${config.get<string>("JWT_EXPIRATION_IN_SECONDS")}s` ,
                  }
              }
              return options;
        })
    }),
    MailerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => ({
          transport: {
            host: config.get<string>('SMTP_HOST'),
            secure: false,
            auth: {
              user: config.get<string>('SMTP_USERNAME'),
              pass: config.get<string>('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: config.get<string>('SMTP_USERNAME')
          },
          template: {
            dir: join(__dirname, './templetes'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true
            }
          }
        }),
        inject: [ConfigService]}),
   ],
  controllers: [AppController],
  providers: [AppService, UtilService, IsRootInterceptor, JwtService, ConfigService],
  exports:[PassportModule]
})
export class AppModule {}
