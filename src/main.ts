import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from "helmet";
import * as csurf from "csurf";
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  ////Configuration///////
  const configService = app.get(ConfigService);

  //////Global Pipes///////
  app.useGlobalPipes(
    new ValidationPipe({
        whitelist : true
    })
  )
 //////////Static Files///////
  app.useStaticAssets(join(__dirname, ".", "public"));

 
  ////Swagger Open Api Docs///////
  const swaggerOpenAPIDoc = new DocumentBuilder()
  .setTitle('Driving School Server')
  .setDescription('Server Documentation')
  .setVersion('0.0.1')
  .addTag('documentation').setContact("Pritam Biswas", "https://github.com/pritambiswas00", "pritambiswas060@gmail.com")
  .build();
  const document = SwaggerModule.createDocument(app, swaggerOpenAPIDoc);
  SwaggerModule.setup('api', app, document);

  ////Enable Cors/////
  app.enableCors({ origin: '*', credentials: true });

  ///Helmet////
  app.use(helmet.contentSecurityPolicy());
  app.use(helmet.crossOriginResourcePolicy());

  ///Csurf///
  // app.use(csurf())

  const PORT = +configService.get("PORT"); 
  await app.listen(PORT, () => {
       console.log(`Environment : ${configService.get("ENV")}`);
       console.log(`Server listening at http://localhost:${PORT || process.env.PORT}`);
  });
}
bootstrap();
