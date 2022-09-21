import { StudentRepository } from '../../repository/student.repository';
import { CourseRepository } from '../../repository/course.repository';
import { StudentEntity } from './../student.entity';
import { Injectable, NotFoundException, HttpStatus, BadRequestException, UnauthorizedException, NotAcceptableException } from '@nestjs/common';
import { createDto } from '../dto/create.dto';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class StudentService {
    constructor(
      @InjectRepository(StudentRepository)
      private readonly studentRepository: StudentRepository,
      
      @InjectRepository(CourseRepository)
      private readonly courseRepository: CourseRepository,
    ) {}
    
      findAll(): Promise<StudentEntity[]> {
        return this.studentRepository.customFindAll()
      }
    
      async findOne(id: number){
        const foundStudent = await this.studentRepository.customFindOne(id);
        if(foundStudent !== undefined){
          if(foundStudent.length > 0){
            return Promise.resolve(foundStudent)
          }else{
            throw new NotFoundException()
          }
        }
      }

      async create(dto:createDto){
        const now = String(new Date())
        return await this.studentRepository.customSave({
          firstName: dto.firstName,
          lastName: dto.lastName,
          age: dto.age,
          login: dto.login,
          password: dto.password,
          loginAt: now,
          isOnline: true
      })
      }

      async update(dto, id){
        const response = await this.studentRepository.customUpdate(id, dto)
        if(response !== undefined){
          if(response.affected >= 1){
            return this.studentRepository.customFindOne(id)
          }else{
            throw new BadRequestException()
          }
        }else{
          throw new BadRequestException()
        }
      }
    
      async remove(id: number){
        const response = await this.studentRepository.customDelete(id)
        if(response.affected >= 1){
          return HttpStatus.ACCEPTED
        }else{
          throw new BadRequestException()
        }
      }

      async login(login: string, password: string){
        const foundStudent = await this.studentRepository.customLogin(login, password)
        if(foundStudent !== undefined && foundStudent !== null){
          const online = {
            isOnline: true
          }
          await this.studentRepository.customUpdate(foundStudent.id, online)
          return foundStudent
        }else{
          throw new UnauthorizedException()
        }
      }
      
      async logOut(id:number){
        const notOnline = {
          isOnline: false
        }
        const foundStudent = await this.studentRepository.customUpdate(id, notOnline)
        if(foundStudent.affected >= 1){
          return HttpStatus.ACCEPTED
        }else{
          throw new BadRequestException()
        }
      }

      async purchaseCourse(courseId:number, studentId:number){
        const foundStudent = await this.studentRepository.customFindOne(studentId)
        const foundCourse = await this.courseRepository.customFindOne(courseId)
        if(foundStudent.length >= 1 && foundCourse.length >= 1){
          if(foundStudent.length > 0 && foundCourse.length > 0){
            let studentCourses = []
            studentCourses = JSON.parse(foundStudent[0].courses)
            if(studentCourses.includes(courseId)){
              throw new NotAcceptableException()
            }else{
              studentCourses.push(courseId)
              foundStudent[0].courses = JSON.stringify(studentCourses)
              const response = await this.studentRepository.customUpdate(studentId, foundStudent[0])
              if(response.affected >= 1){
                return await this.studentRepository.customFindOne(studentId)
              }
            }
          }
        }else{
          throw new BadRequestException()
        }
      }
}
