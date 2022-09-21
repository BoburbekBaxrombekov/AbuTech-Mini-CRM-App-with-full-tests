import { Module } from '@nestjs/common';
import { LessonController } from './lesson_controller/lesson.controller';
import { LessonService } from './lesson_service/lesson.service';
import { LessonRepository } from '../repository/lesson.repository'
import { CourseRepository } from '../repository/course.repository';
import { TypeOrmExModule } from '../database/typeorm-ex.module';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([LessonRepository, CourseRepository])],
  controllers: [LessonController],
  providers: [LessonService]
})
export class LessonModule {}
