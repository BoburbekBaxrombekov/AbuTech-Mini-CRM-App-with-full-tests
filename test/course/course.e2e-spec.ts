import { StudentRepository } from './../../src/repository/student.repository';
import { StudentEntity } from './../../src/student/student.entity';
import { CourseModule } from '../../src/course/course.module';
import { CourseEntity } from './../../src/course/course.entity';
import { CourseRepository } from '../../src/repository/course.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {TypeOrmModule} from '@nestjs/typeorm'
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('Course Module (e2e)', () => {
  let basic_app: INestApplication;
  let courseBasicRepository
  let app: INestApplication;
  let courseRepository
  let studentRepository
  var defaultCourseID
  var defaultStudentID
  let invalidNumber = Math.round(Math.random() * 1000)

  const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
  const randomTitle = uniqueNamesGenerator({
    dictionaries: [names]
  });
  const randomPrice = uniqueNamesGenerator({
    dictionaries: [numberDictionary]
  });
  
  const randomDesc = uniqueNamesGenerator({
    dictionaries: [languages, NumberDictionary, names]
  });

  const createMockDto = {
    "title": randomTitle,
    "desc": randomDesc,
    "price": randomPrice,
  }
  
  const updateMockDto = {
    "title": randomTitle,
    "desc": randomDesc
  }
  

  beforeAll(async () => {
    const moduleBasicFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot({
        type: "postgres",
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'boburbek',
        database: 'postgres',
        entities: [CourseEntity],
        synchronize: true
      }), CourseModule],
    }).compile();

    basic_app = moduleBasicFixture.createNestApplication();
    await basic_app.init();
    courseBasicRepository = moduleBasicFixture.get<CourseRepository>(CourseRepository)
    try{
      await courseBasicRepository.query('CREATE DATABASE testdb')
    }catch(err){
      await courseBasicRepository.query(`SELECT 'CREATE DATABASE testdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testdb')`)
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
        entities: [CourseEntity, StudentEntity],
        synchronize: true,
      }), CourseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    courseRepository = moduleFixture.get<CourseRepository>(CourseRepository)
    studentRepository = moduleFixture.get<StudentRepository>(StudentRepository)

    let result = await studentRepository.save(studentRepository.create({
      "firstName": randomTitle,
      "lastName": randomDesc,
      "age": randomPrice,
      "login": randomTitle,
      "password": randomPrice,
      "loginAt": String(Date())
  }))
    defaultStudentID = result.id
    
  });

  it('/course/add (POST) => { CREATE }', async() => {
    const response = await request(app.getHttpServer())
      .post('/course/add')
      .send(createMockDto)
      .expect(201)
    defaultCourseID = response.body.id
  });
  it('/course/all (GET)  => { GET ALL }', async() => {
    return request(app.getHttpServer())
      .get('/course/all')
      .expect(200)
  });
  
  it('/purchase-course-count/:id (GET)  => { GET PURCHASE => 404 }', async() => {
    return request(app.getHttpServer())
      .get(`/purchase-course-count/${invalidNumber}`)
      .expect(404)
  });
  
  it(`/course/get-one/:id (GET)  => { GET ONE }`, async() => {
    return request(app.getHttpServer())
      .get(`/course/get-one/${defaultCourseID}`)
      .expect(200)
  });
  
  it(`/course/get-one/:id (GET)  => { GET ONE => 404 }`, async() => {
    return request(app.getHttpServer())
      .get(`/course/get-one/${invalidNumber}`)
      .expect(404)
  });
  
  it(`/course/edit/:id (PUT)  => { EDIT }`, async() => {
    return request(app.getHttpServer())
      .put(`/course/edit/${defaultCourseID}`)
      .send(updateMockDto)
      .expect(200)
  });
  
  it(`/course/edit/:id (PUT)  => { EDIT => 400 }`, async() => {
    return request(app.getHttpServer())
      .put(`/course/edit/${invalidNumber}`)
      .send(updateMockDto)
      .expect(400)
  });
    


     it(`/course/delete/:id (DELETE)  => { DELETE }`, async() => {
        return request(app.getHttpServer())
          .delete(`/course/delete/${defaultCourseID}`)
          .expect(200)  
      });
     
      it(`/course/delete/:id (DELETE)  => { DELETE => 400 }`, async() => {
        return request(app.getHttpServer())
          .delete(`/course/delete/${invalidNumber}`)
          .expect(400)  
      });

  afterAll(async () => {
    await courseRepository.query('DROP TABLE course_entity');
    await studentRepository.query('DROP TABLE student_entity');
    app.close()
  });
});
