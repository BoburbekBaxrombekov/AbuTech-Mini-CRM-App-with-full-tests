import { updateDto } from '../dto/update.dto';
import {createDto} from '../dto/create.dto'
import { loginDto } from '../dto/login.dto';
import { StudentService } from './../student_service/student.service';
import { Body, Controller, HttpStatus, Param, Post, Get, Put, Delete, NotFoundException, BadRequestException } from '@nestjs/common';

@Controller('student')
export class StudentController {
    constructor(private readonly studentsService: StudentService){}
    @Get('all')
    getStudents(){
        return this.studentsService.findAll()
    }
    @Get('get/:id')
    getOneStudent(@Param() {id}){
        return this.studentsService.findOne(id)
    }
    @Post('add')
    async createStudent(@Body() body:createDto){
        return await this.studentsService.create(body)
    }
    @Put('edit/:id')
    async updateStudent(@Body() body:updateDto, @Param() {id}){
        return await this.studentsService.update(body, id)
    }
    @Delete('delete/:id')
    async deleteStudent(@Param() {id}){
        return await this.studentsService.remove(id)
    }
    @Post('login')
    async login(@Body() dto:loginDto){
        return await this.studentsService.login(dto.login, dto.password)
    }
    @Post('logout/:id')
    async logOut(@Param() {id}){
        return await this.studentsService.logOut(id)
    }
    @Post('purchase/:id')
    async purchaseCourse(@Param() {id}, @Body() dto){
        return this.studentsService.purchaseCourse(dto.id, id)
    }
}
