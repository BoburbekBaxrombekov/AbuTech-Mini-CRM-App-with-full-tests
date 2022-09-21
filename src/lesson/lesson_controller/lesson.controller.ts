import { Controller, Get, Param, Post, Body, UseInterceptors, UploadedFile, Delete, Put, HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { LessonService } from '../lesson_service/lesson.service';
import { createDto } from '../dto/create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { updateDto } from '../dto/update.dto'
import {extname} from 'path';
import { diskStorage } from 'multer';

const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + ".mp3")
    }
  })

@Controller('lesson')
export class LessonController {
    constructor(private readonly lessonService: LessonService){}
    @Get('all')
    async getAllLessons(){
        return await this.lessonService.getAll()
    }
    
    @Get('get/:id')
    async getOneLesson(@Param() {id}){
        return await this.lessonService.getOne(id)
    }
    
    @Post('add')
    @UseInterceptors(FileInterceptor('video', {storage: storage}))
    async createLesson(@Body() dto:createDto, @UploadedFile() file: Express.Multer.File){
        const fileName = `uploads/${file.filename}`
        return await this.lessonService.create(dto, fileName)
    }

    @Delete('delete/:id')
    async deleteLesson(@Param() {id}){
        return await this.lessonService.delete(id)
    }
    
    @Put('edit/:id')
    @UseInterceptors(FileInterceptor('video', {storage: storage}))
    async updateLesson(@Body() dto:updateDto, @Param() {id}, @UploadedFile(__filename) file: Express.Multer.File){
        if(file){
            dto.video = `uploads/${file.filename}.${file.mimetype}`
            return await this.lessonService.update(dto, id)
        }else{
            return await this.lessonService.update(dto, id)
        }
    }
}
