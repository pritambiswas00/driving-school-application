import { BadRequestException, Body, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Admin, AdminDocument } from "./Entity/admin.model";
import { AddAdmin, Login } from "./Dtos/admin.dtos";
import { ConfigService } from "@nestjs/config";
import { UtilService } from "./Utils/Utils";
import { ObjectId } from "mongodb";
import { JwtService } from "@nestjs/jwt";
import { LazyModuleLoader } from "@nestjs/core";



@Injectable()
export class AppService {
    constructor(@InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>, private readonly configService:ConfigService, private readonly utilService: UtilService, private readonly jwtService: JwtService, private readonly lazyModuleLoader: LazyModuleLoader) {}


     login (@Body() superadmin: Login):Promise<string> { 
            const superAdminUsername = this.configService.get<string>("SUPER_ADMIN_USERNAME");
            const superAdminPassword = this.configService.get<string>("SUPER_ADMIN_PASSWORD");
           if(superadmin.email !== superAdminUsername) {
               throw new UnauthorizedException("Email didn't matched");
           }else if(superadmin.password !== superAdminPassword) {
              throw new UnauthorizedException("Password didn't matched");
           }
           const payload = { superadmin: superadmin.email };
           const access_token:any = this.jwtService.sign(payload, { secret: this.configService.get<string>("JWT_SECRET_ROOT")});
           return access_token;
    }

    async getAllAdmins(){
         try{
           const admins = await this.adminModel.find({});
           let modifiedAdmins = [];
           for(let i = 0; i < admins.length; i++) {
                modifiedAdmins.push({
                    id: admins[i]._id,
                    email: admins[i].email
                })
           };
           return modifiedAdmins;
         }catch(error){
             throw new InternalServerErrorException(error);
         }
    }

    async addAdmin(admin: AddAdmin) {
            const adminList = await this.adminModel.find({});
            if(adminList.length === +this.configService.get<string>("MAX_ADMIN_COUNT")) {
                throw new BadRequestException("Admin can't be created. Max range of admin is "+this.configService.get<string>("MAX_ADMIN_COUNT"));
            }
            let [isAdminExist] = adminList.filter((ele) => {
                        return ele.email === admin.email;
            })
            if(isAdminExist) {
                throw new BadRequestException("Email already exists.");
            }
             const hashedPassword = await this.utilService.hashPassword(admin.password);
             isAdminExist = new this.adminModel({ email : admin.email, password : hashedPassword, phonenumber: admin.phonenumber });
             await isAdminExist.save();
             return isAdminExist;
    }

    async deleteAdmin(id: ObjectId) :Promise<Admin>{
          const isAdminExist = await this.adminModel.findOneAndDelete({_id: new Types.ObjectId(id)})
          if(!isAdminExist) {
              throw new NotFoundException("ID not found.")
          }
          return isAdminExist;
    }
}