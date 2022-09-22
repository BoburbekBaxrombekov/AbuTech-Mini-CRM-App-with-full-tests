import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentRepository } from '../../repository/student.repository';
import { CourseRepository } from '../../repository/course.repository';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(StudentRepository)
      private readonly studentRepository: StudentRepository,
      
        @InjectRepository(CourseRepository)
        private readonly courseRepository: CourseRepository,
    ) {}
    async getAll(){
        return await this.courseRepository.customFindAll()
    }
    async getOne(id:number){
        const foundCourse = this.courseRepository.customFindOne(id)
        if((await foundCourse).length > 0){
            return foundCourse
        }else{
            throw new NotFoundException()
        }
    }
    async getPurchase(id:number){
        const foundStudent = await this.studentRepository.customFindOne(id)
        if(foundStudent.length > 0){
            const purchaseCourse = JSON.parse(foundStudent[0]["courses"])
            if(purchaseCourse.length > 0){
                const newArray = []
                for(let i = 0; i < purchaseCourse.length; i++){
                    const foundCourse = await this.courseRepository.customFindOne(purchaseCourse[i])
                    if(foundCourse){
                        newArray.push(foundCourse[0])
                    }
                }
                return newArray
            }else{
                return []
            }
        }else{
            throw new NotFoundException()
        }
    }
    async create(dto){
        const createdCourse =  await this.courseRepository.customSave({
            title: dto.title,
            desc: dto.desc,
            price: dto.price
        })
        return createdCourse
    }
    async update(id:number, dto){
        const createdCourse =  await this.courseRepository.customUpdate(id, dto)
        if(createdCourse.affected >= 1){
            return this.courseRepository.customFindOne(id)
        }
        throw new BadRequestException()
    }
    async deleteCourse(id:number){
        const deletedCourse =  await this.courseRepository.customDelete(id)
        if(deletedCourse.affected >= 1){
            return HttpStatus.ACCEPTED
        }else{
            throw new BadRequestException()
        }
    }
}
