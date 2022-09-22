import { CourseModule } from './../../src/course/course.module';
import { CourseEntity } from '../../src/course/course.entity';
import { CourseRepository } from './../../src/repository/course.repository';
import { StudentRepository } from '../../src/repository/student.repository';
import { StudentEntity } from '../../src/student/student.entity';
import { StudentModule } from '../../src/student/student.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {TypeOrmModule} from '@nestjs/typeorm'
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('Student Module (e2e)', () => {
  let basic_app: INestApplication;
  let studentBasicRepository
  let app: INestApplication;
  let studentRepository
  let courseRepository
  var defaultStudentID
  var defaultCourseID
  let invalidNumber = Math.round(Math.random() * 1000)

  const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
  const randomName = uniqueNamesGenerator({
    dictionaries: [names]
  });
  const randomSurename = uniqueNamesGenerator({
    dictionaries: [names]
  });
  const randomAge = uniqueNamesGenerator({
    dictionaries: [numberDictionary]
  });
  
  const randomLogin = uniqueNamesGenerator({
    dictionaries: [adjectives]
  });
  
  const randomPassword = uniqueNamesGenerator({
    dictionaries: [languages, NumberDictionary, names]
  });

  const createMockDto = {
    "firstName": randomName,
    "lastName": randomSurename,
    "age": randomAge,
    "login": randomLogin,
    "password": randomPassword,
    "loginAt": `${Date()}`
  }
  
  const updateMockDto = {
    "firstName": randomName,
    "lastName": randomSurename,
    "age": randomAge
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
        entities: [StudentEntity],
        synchronize: true
      }), StudentModule],
    }).compile();

    basic_app = moduleBasicFixture.createNestApplication();
    await basic_app.init();
    studentBasicRepository = moduleBasicFixture.get<StudentRepository>(StudentRepository)
    try{
      await studentBasicRepository.query('CREATE DATABASE testdb')
    }catch(err){
      await studentBasicRepository.query(`SELECT 'CREATE DATABASE testdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testdb')`)
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
        entities: [StudentEntity, CourseEntity],
        synchronize: true,
      }), StudentModule, CourseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    studentRepository = moduleFixture.get<StudentRepository>(StudentRepository)
    courseRepository = moduleFixture.get<CourseRepository>(CourseRepository)

    let result = await courseRepository.save(courseRepository.create({
      "title": "Some Title 7",
      "desc": "Description",
      "price": 2000000
    }))
    defaultCourseID = result.id
    
  });
  it('{ CREATE } => /student/add (POST)', async() => {
    const response = await request(app.getHttpServer())
      .post('/student/add')
      .send(createMockDto)
      .expect(201)
    defaultStudentID = response.body.id
  });
  it('{ GET ALL }  => /student/all (GET)', async() => {
    return request(app.getHttpServer())
      .get('/student/all')
      .expect(200)
  });
  
  it(`{ GET ONE } => /student/get/:id (GET)`, async() => {
    return request(app.getHttpServer())
      .get(`/student/get/${defaultStudentID}`)
      .expect(200)
  });
  
  it(`{ GET ONE [ 404 ] } => /student/get/:id (GET)`, async() => {
    return request(app.getHttpServer())
      .get(`/student/get/${invalidNumber}`)
      .expect(404)
  });
  
  it(`{ EDIT } => /student/edit/:id (PUT)`, async() => {
    return request(app.getHttpServer())
      .put(`/student/edit/${defaultStudentID}`)
      .send(updateMockDto)
      .expect(200)
  });
  
  it(`{ EDIT [ 400 ] } => /student/edit/:id (PUT)`, async() => {
    return request(app.getHttpServer())
      .put(`/student/edit/${invalidNumber}`)
      .send(updateMockDto)
      .expect(400)
  });

    it(`{ LOGIN } => /student/login (POST)`, async() => {
        return request(app.getHttpServer())
        .post(`/student/login`)
        .send({login: randomLogin, password: randomPassword})
        .expect(201)
     });
    
     it(`{ LOGIN [ 401 ] } => /student/login (POST)`, async() => {
        return request(app.getHttpServer()) 
        .post(`/student/login`)
        .send({login: "dwadw@fawa", password: "dawdaddwadw@fawadw2eddad"})
        .expect(401)
     });
     
     
     it(`{ LOG OUT } => /student/logout/:id (POST)`, async() => {
        return request(app.getHttpServer()) 
        .post(`/student/logout/${defaultStudentID}`)
        .expect(201)
     });
     
     it(`{ LOG OUT [ 400 ] } => /student/logout/:id (POST)`, async() => {
        return request(app.getHttpServer()) 
        .post(`/student/logout/${invalidNumber}`)
        .expect(400)
     });
     
     it(`{ PURCHASE } => /student/purchase/:id (POST)`, async() => {
        return request(app.getHttpServer()) 
        .post(`/student/purchase/${defaultStudentID}`)
        .send({id: defaultCourseID})
        .expect(201)
     });

     it(`{ PURCHASE [ 406 ] } => /student/purchase/:id (POST)`, async() => {
      return request(app.getHttpServer()) 
      .post(`/student/purchase/${defaultStudentID}`)
      .send({id: defaultCourseID})
      .expect(406)
   });
     
     it(`{ PURCHASE [ 400 ] } => /student/purchase/:id (POST)`, async() => {
        return request(app.getHttpServer()) 
        .post(`/student/purchase/${defaultStudentID}`)
        .send({id: invalidNumber})
        .expect(400)
     });

     it(`{ DELETE } => /student/delete/:id (DELETE)`, async() => {
        return request(app.getHttpServer())
          .delete(`/student/delete/${defaultStudentID}`)
          .expect(200)  
      });
     
      it(`{ DELETE [ 400 ] } => /student/delete/:id (DELETE)`, async() => {
        return request(app.getHttpServer())
          .delete(`/student/delete/4214212`)
          .expect(400)  
      });

  afterAll(async () => {
    await studentRepository.query('DROP TABLE student_entity');
    await courseRepository.query('DROP TABLE course_entity');
    app.close()
  });
});
