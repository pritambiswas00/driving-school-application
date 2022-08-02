import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from "@nestjs/mongoose"
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const options: MongooseModuleOptions = {
            uri: configService.get("DBURI"),
            useNewUrlParser: true,
            useUnifiedTopology: true,
          };
          return options;
        },
      })
    ],
  })
export class ConnectionModule {}