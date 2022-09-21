import { LessonRepository } from '../../repository/lesson.repository';
import { CourseRepository } from '../../repository/course.repository';
import { Injectable, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LessonService {
    constructor(
        @InjectRepository(LessonRepository)
        private readonly lessonRepository: LessonRepository,
        
        @InjectRepository(CourseRepository)
        private readonly courseRepository: CourseRepository,
    ) {}
    async getAll(){
        return await this.lessonRepository.customFindAll()
    }
    async getOne(id:number){
        const foundLesson = await this.lessonRepository.customFindOne(id)
        if(foundLesson.length >= 1){
            return foundLesson
        }else{
            throw new NotFoundException()
        }
    }
    
    async create(dto, videoName){
        const foundCourse = this.courseRepository.customFindOne(dto.courseId)
        if((await foundCourse).length > 0){
            const createdLesson = await this.lessonRepository.customSave({
                name: dto.name,
                duration: dto.duration,
                video: videoName,
                teacherName: dto.teacherName,
                courseId: dto.courseId
            })
            return createdLesson
        }else{
            throw new BadRequestException()
        }
    }

    async delete(id){
        const result = await this.lessonRepository.customDelete(id)
        if(result.affected >= 1){
            return HttpStatus.ACCEPTED
        }else{
            throw new BadRequestException()
        }
    }
    
    async update(dto, id){
        const result = await this.lessonRepository.customUpdate(id, dto)
        if(result.affected >= 1){
            return await this.lessonRepository.customFindOne(id)
        }else{
            throw new BadRequestException()
        }
    }
}
