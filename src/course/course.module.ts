import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { Module } from '@nestjs/common';
import { CourseService } from './course_service/course.service';
import { CourseController } from './course_controller/course.controller';
import { StudentRepository } from '../repository/student.repository';
import { CourseRepository } from '../repository/course.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([StudentRepository, CourseRepository])],
  providers: [CourseService],
  controllers: [CourseController]
})
export class CourseModule {}
