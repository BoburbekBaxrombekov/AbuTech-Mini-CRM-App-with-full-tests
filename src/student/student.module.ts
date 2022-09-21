import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { StudentRepository } from '../repository/student.repository';
import { Module } from '@nestjs/common';
import { StudentController } from './student_controllers/student.controller';
import { StudentService } from './student_service/student.service';
import { CourseRepository } from '../repository/course.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([StudentRepository, CourseRepository])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
