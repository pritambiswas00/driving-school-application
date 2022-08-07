import { Controller, Post, Body, Get, Patch, Delete, Headers, UseInterceptors, UseGuards, HttpStatus, Param, Query} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminService } from '../Services/admin.service';
import { IsAdmin } from 'src/Decorators/isAdmin.decorator';
import { IsAdminInterceptor } from 'src/Interceptors/isAdmin.interceptor';
import { AdminGuard } from 'src/Guards/isAdmin.guard';
import { AdminPayload, CreateUser, Login, UpdateUser } from 'src/Dtos/admin.dtos';
import { ObjectId } from 'mongodb';
import { TrainerCreate, TrainerUpdate } from 'src/Dtos/trainer.dto';
import { CreateSchedule, UpdateSchedule } from 'src/Dtos/schedule.dtos';
import { Admin } from 'src/Entity/admin.model';
import { User } from 'src/Entity/user.model';

 
@ApiTags("Admin")
@Controller('admin')
@UseInterceptors(IsAdminInterceptor)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @ApiOperation({ summary: 'Login Admin ****' })
    @Post("/login")
    async login(@Body() body: Login) {
        const token = await this.adminService.login(body);
        return {
            statusCode : HttpStatus.OK,
            message: "Successfully logged in...",
            access_token : token,
        }
    }

    @ApiOperation({ summary: 'Logout Admin ****' })
    @Post("/logout")
    @UseGuards(AdminGuard)
    async logout(@Headers("Authorization") token: string, @IsAdmin() admin: any) {
         const editedToken = token.replace("Bearer ", "");
         return this.adminService.logout(editedToken, admin);
    }
    

    @ApiOperation({ summary: 'Add User ****' })
    @Post("/addUser")
    @UseGuards(AdminGuard)
    async createUser(@Body() body: CreateUser, @IsAdmin() admin : Admin) {
           const user = await this.adminService.createUser(body);
           return {
              status: HttpStatus.CREATED,
              message: `User ${user.name} created successfully`,
              user: user
           }
    }

    @ApiOperation({ summary: 'Get User ****' })
    @Get("/getUser/:userId")
    @UseGuards(AdminGuard)
    async getUser(@Param("userId") userId : ObjectId, @IsAdmin() admin : Admin){
         const userDetails = await this.adminService.getUser(userId);
         return {
             status: HttpStatus.OK,
             user: userDetails
         }
    }


    @ApiOperation({ summary: 'Get All Users ****' })
    @Get("/getAllUsers")
    @UseGuards(AdminGuard)
    async getAllUsers(@IsAdmin() admin : Admin, ) {
         const users = await this.adminService.getAllUsers();
         return {
            status: HttpStatus.OK,
            users: users
         }
    }

    @ApiOperation({ summary: 'Edit User ****' })
    @Patch("/editUser/:userId")
    @UseGuards(AdminGuard)
    async editUser(@Param("userId") userId: ObjectId, @Body() body: UpdateUser, @IsAdmin() admin : Admin) {
         const updatedUser:User = await this.adminService.editUser(body, userId); 
         return {
             status: HttpStatus.OK,
             message: `User ${updatedUser.name} updated successfully`
         }  
    }

    @ApiOperation({ summary: 'Delete User ****' })
    @Delete("/deleteUser/:userId")
    @UseGuards(AdminGuard)
    async deleteUser(@Param("userId") userId: ObjectId, @IsAdmin() admin : Admin) {
         const user:User = await this.adminService.deleteUser(userId);
         return {
             status: HttpStatus.OK,
             message: `User ${user.name} deleted successfully`
         }
    }

    @ApiOperation({ summary: 'Add Trainer ****' })
    @Post("/addTrainer")
    @UseGuards(AdminGuard)
    async addTrainer (@Body() body: TrainerCreate, @IsAdmin() admin : Admin) {
         const trainer = await this.adminService.addTrainer(body);
         return {
             status: HttpStatus.CREATED,
             message: `Trainer ${trainer.trainername} created successfully`,
             trainer : trainer
         }
    }

    @ApiOperation({ summary: 'Edit Trainer ****' })
    @Patch("/editTrainer/:trainerId")
    @UseGuards(AdminGuard)
    async editTrainer (@Param("trainerId") trainerId : ObjectId,@Body() body: TrainerUpdate, @IsAdmin() admin : Admin) {
        await this.adminService.editTrainer(body, trainerId);
        return { 
             status : HttpStatus.OK,
             message : `Trainer updated successfully.`,
          }
    }

    @ApiOperation({ summary: 'Delete Trainer ****' })
    @Delete("/deleteTrainer/:trainerId")
    @UseGuards(AdminGuard)
    async deleteTrainer (@Param("trainerId") trainerId: ObjectId, @IsAdmin() admin : Admin) {
            const trainer = await this.adminService.deleteTrainer(trainerId);
            const { trainername } = trainer;
            return {
                  status: HttpStatus.OK,
                  message: `Trainer ${trainername} deleted successfully`
            }
    }

    @ApiOperation({ summary: 'Get All Trainers ****' })
    @Get("/getAllTrainers") 
    @UseGuards(AdminGuard)
    async getAllTrainers (@IsAdmin() admin : Admin, @Query("status") status: string | undefined) {
         const trainers = await this.adminService.getAllTrainers(status);
         return {
             status : HttpStatus.OK,
             trainers : trainers
         }
    }

    @ApiOperation({ summary: 'Admin Create Schedule ****' })
    @Post("/create/user/schedule/:userId")
    @UseGuards(AdminGuard)
    async createSchedule(@Param("userId") userId: ObjectId, @Body() body: CreateSchedule, @IsAdmin() admin : Admin) {
          const schedule = await this.adminService.createSchedule(body, userId);
          return {
                 status: HttpStatus.OK,
                 message : `Schedule ${schedule.schedulename} created successfully`,
          }
    }

    @ApiOperation({ summary: 'Admin Edit Schedule ****' })
    @Patch("/edit/user/schedule/:scheduleId")
    @UseGuards(AdminGuard)
    async updateSchedule(@Body() body: UpdateSchedule, @Param("scheduleId") scheduleId: ObjectId, @IsAdmin() admin : Admin) {
          const updatedSchedule = await this.adminService.editSchedule(body, scheduleId);
          return {
                status: HttpStatus.OK,
                message : `Schedule updated successfully`,
          }
    }


    @ApiOperation({ summary: 'Admin Delete Schedule ****' })
    @Delete("/delete/user/schedule/:scheduleId")
    @UseGuards(AdminGuard)
    async deleteSchedule(@Param("scheduleId") scheduleId: ObjectId, @IsAdmin() admin : Admin) {
          const deletedSchedule = await this.adminService.deleteSchedule(scheduleId);
          return {
                    status: HttpStatus.OK,
                    message : `Schedule ${deletedSchedule.schedulename} deleted successfully`,
          }
    }

    @ApiOperation({ summary: 'Admin Get Schedules ****' })
    @Get("/getAllSchedules")
    @UseGuards(AdminGuard)
    async getSchedules(@Param("userId") userId: ObjectId|undefined, @Query("status") status: string|undefined , @IsAdmin() admin : Admin) {
          const userSchedules = await this.adminService.getSchedules(userId, status);
          return {
             status : HttpStatus.OK,
             schedules : userSchedules
          }
    }
}
