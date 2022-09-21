import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import {TypeOrmModule} from '@nestjs/typeorm'
import { StudentEntity } from './student/student.entity'
import { CourseEntity } from './course/course.entity';
import { LessonEntity } from './lesson/lesson.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmExModule } from './database/typeorm-ex.module';
import { StudentRepository } from './repository/student.repository';
import { CourseRepository } from './repository/course.repository';
import { LessonRepository } from './repository/lesson.repository';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "postgres",
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'boburbek',
    database: 'testing_app',
    entities: [StudentEntity, CourseEntity, LessonEntity],
    synchronize: true,
  }), TypeOrmExModule.forCustomRepository([StudentRepository, CourseRepository, LessonRepository]), StudentModule, CourseModule, LessonModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', ''),
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
