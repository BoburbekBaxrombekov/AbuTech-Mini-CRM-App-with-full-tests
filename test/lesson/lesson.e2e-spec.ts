import { CourseRepository } from './../../src/repository/course.repository';
import { CourseEntity } from './../../src/course/course.entity';
import { LessonRepository } from './../../src/repository/lesson.repository';
import { LessonModule } from '../../src/lesson/lesson.module';
import { LessonEntity } from '../../src/lesson/lesson.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {TypeOrmModule} from '@nestjs/typeorm'
const { uniqueNamesGenerator, names, NumberDictionary, languages } = require('unique-names-generator');

describe('Lesson Module (e2e)', () => {
  let basic_app: INestApplication;
  let lessonBasicRepository
  let app: INestApplication;
  let lessonRepository
  let courseRepository
  var defaultLessonID
  var defaultCourseID
  let invalidNumber = Math.round(Math.random() * 1000)

  const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
  const randomName = uniqueNamesGenerator({
    dictionaries: [names]
  });
  const randomDuration = uniqueNamesGenerator({
    dictionaries: [numberDictionary]
  });
  
  const randomTeacherName = uniqueNamesGenerator({
    dictionaries: [languages, NumberDictionary, names]
  });

  

  beforeAll(async () => {
    const moduleBasicFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot({
        type: "postgres",
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'boburbek',
        database: 'postgres',
        entities: [LessonEntity],
        synchronize: true
      }), LessonModule],
    }).compile();

    basic_app = moduleBasicFixture.createNestApplication();
    await basic_app.init();
    lessonBasicRepository = moduleBasicFixture.get<LessonRepository>(LessonRepository)
    try{
      await lessonBasicRepository.query('CREATE DATABASE testdb')
    }catch(err){
      await lessonBasicRepository.query(`SELECT 'CREATE DATABASE testdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testdb')`)
    }
    basic_app.close()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot({
        type: "postgres",
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'boburbek',
        database: 'testdb',
        entities: [LessonEntity, CourseEntity],
        synchronize: true,
      }), LessonModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    lessonRepository = moduleFixture.get<LessonRepository>(LessonRepository)
    courseRepository = moduleFixture.get<CourseRepository>(CourseRepository)

    let result = await courseRepository.save(courseRepository.create({
      "title": "Some Title 7",
      "desc": "Description",
      "price": 2000000
    }))
    defaultCourseID = result.id
  });

  it('/lesson/add (POST) => { CREATE }', async() => {
    const response = await request(app.getHttpServer())
      .post('/lesson/add')
      .set("Content-Type", 'multipart/form-data')
      .attach('video', `${__dirname}/IMG_5173.MP4`)
      .field("name", randomName)
      .field("duration", randomDuration)
      .field("courseId", defaultCourseID)
      .field("teacherName", randomTeacherName)
      .expect(201)
    defaultLessonID = response.body.id
  });
  
  it('/lesson/add (POST) => { CREATE => 400 }', async() => {
    return await request(app.getHttpServer())
      .post('/lesson/add')
      .set("Content-Type", 'multipart/form-data')
      .attach('video', `${__dirname}/IMG_5173.MP4`)
      .field("name", randomName)
      .field("duration", randomDuration)
      .field("courseId", invalidNumber)
      .field("teacherName", randomTeacherName)
      .expect(400)
  });
  it('/lesson/all (GET)  => { GET ALL }', async() => {
    return request(app.getHttpServer())
      .get('/lesson/all')
      .expect(200)
  });
  
  it(`/lesson/get/:id (GET)  => { GET ONE }`, async() => {
    return request(app.getHttpServer())
      .get(`/lesson/get/${defaultLessonID}`)
      .expect(200)
  });
  
  it(`/lesson/get/:id (GET)  => { GET ONE => 404 }`, async() => {
    const response = request(app.getHttpServer())
      .get(`/lesson/get/${invalidNumber}`)
      .expect(404)
  });
  
  it(`/lesson/edit/:id (PUT)  => { EDIT }`, async() => {
    return request(app.getHttpServer())
      .put(`/lesson/edit/${defaultLessonID}`)
      .set("Content-Type", 'multipart/form-data')
      .attach('video', `${__dirname}/IMG_5173.MP4`)
      .field("name", "name 2")
      .field("duration", "2 month")
      .field("teacherName", "Someone 2")
      .expect(200)
  });
  
  it(`/lesson/edit/:id (PUT)  => { EDIT => 400 }`, async() => {
    return request(app.getHttpServer())
      .put(`/lesson/edit/${invalidNumber}`)
      .set("Content-Type", 'multipart/form-data')
      .attach('video', `${__dirname}/IMG_5173.MP4`)
      .field("name", "name 2")
      .field("duration", "2 month")
      .field("teacherName", "Someone 2")
      .expect(400)
  });

     it(`/lesson/delete/:id (DELETE)  => { DELETE }`, async() => {
        return request(app.getHttpServer())
          .delete(`/lesson/delete/${defaultLessonID}`)
          .expect(200)  
      });
     
      it(`/lesson/delete/:id (DELETE)  => { DELETE => 400 }`, async() => {
        return request(app.getHttpServer())
          .delete(`/lesson/delete/4214212`)
          .expect(400)  
      });

  afterAll(async () => {
    await lessonRepository.query('DROP TABLE lesson_entity');
    await courseRepository.query('DROP TABLE course_entity');
    app.close()
  });
});
