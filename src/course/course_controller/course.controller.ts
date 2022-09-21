import { Body, Controller, Get, Param, Post, HttpStatus, Put, Delete } from '@nestjs/common';
import { CourseService } from '../course_service/course.service';
import { createDto } from '../dto/create.dto';
import { updateDto } from '../dto/update.dto';

@Controller('course')
export class CourseController {
    constructor(private readonly coursesService: CourseService){}
    @Get('all')
    getAll(){
        return this.coursesService.getAll()
    }
    
    @Get('all-course-count')
    async getAllCourseCount(){
        const courseList = await this.coursesService.getAll()
        return courseList.length
    }
    
    @Get('get-one/:id')
    async getOneCourse(@Param() {id}){
        const foundCourse = await this.coursesService.getOne(id)
        return foundCourse
    }
    
    @Get('purchase-course-count/:id')
    async getPurchaseCourseCount(@Param() {id}){
        return await this.coursesService.getPurchase(id)
    }

    @Post('add')
    async create(@Body() dto:createDto){
        return await this.coursesService.create(dto)
    }
    @Put('edit/:id')
    async updateCourse(@Param() {id}, @Body() dto:updateDto){
        return await this.coursesService.update(id, dto)
    }

    @Delete('delete/:id')
    async deleteCourse(@Param() {id}){
        return await this.coursesService.deleteCourse(id)
    }
}
