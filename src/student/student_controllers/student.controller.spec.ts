import { HttpStatus, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { StudentEntity } from './../student.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '../student_service/student.service';
import { StudentController } from './student.controller';
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('StudentController', () => {
  let controller: StudentController;

  // ! Generator SETTINGS
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

  // ! Mock Data and Dto
  const mockData = [
    {
        "id": 1,
        "firstName": "Boburbek",
        "lastName": "Baxrombekov",
        "age": 13,
        "login": "boburbek4274",
        "password": "bob123",
        "loginAt": "Fri Sep 09 2022 15:08:37 GMT+0500 (Uzbekistan Standard Time)",
        "isOnline": false,
        "createdAt": "2022-09-09T10:08:37.178Z",
        "courses": "[]"
    }
  ]
  
  const createMockDto = {
    "firstName": randomName,
    "lastName": randomSurename,
    "age": randomAge,
    "login": randomLogin,
    "password": randomPassword
  }
  
  const updateMockDto = {
    "firstName": randomName,
    "lastName": randomSurename,
    "age": randomAge
  }
  
  // ! Mock Service Creating
  const mockService = {
    findAll: jest.fn().mockImplementation(() => mockData),
    findOne: jest.fn().mockImplementation(async(id) => {
      const foundStudent = mockData.find(item => item.id == id)
      if(foundStudent){
        return foundStudent
      }else{
        throw new NotFoundException()
      }
    }),
    create: jest.fn().mockImplementation(async (dto) => dto),
    update: jest.fn().mockImplementation(async(dto, id) => {
      const foundStudent = mockData.find(item => item.id == id)
      if(foundStudent){
        dto.firstName ? foundStudent.firstName = dto.firstName : ""
        dto.lastName ? foundStudent.lastName = dto.lastName : ""
        dto.age ? foundStudent.age = dto.age : ""
        return foundStudent
      }else{
        throw new BadRequestException()
      }
    }),
    login: jest.fn().mockImplementation(async(login: string, password: string) => {
      const foundStudent = mockData.find(student => student.login == login && student.password == password)
      if(foundStudent){
        const anotherStudent = mockData.findIndex(item => item.id == foundStudent.id)
        mockData[anotherStudent].isOnline = true
        return mockData[anotherStudent]
      }else{
        throw new UnauthorizedException()
      }
    }),
    logOut: jest.fn().mockImplementation(async (id: number) => {
      const foundStudentIndex = mockData.findIndex(item => item.id == id)
      if(foundStudentIndex >= 0 && mockData[foundStudentIndex].isOnline == true){
        mockData[foundStudentIndex].isOnline = false
        return mockData[foundStudentIndex]
      }else{
        throw new BadRequestException()
      }
    }),
    purchaseCourse: jest.fn().mockImplementation(async (courseId:number, studentId:number) => {
      const foundStudentIndex = mockData.findIndex(item => item.id == studentId)
      if(foundStudentIndex >= 0){
        const newData = JSON.parse(mockData[foundStudentIndex].courses)
        newData.push(courseId)
        mockData[foundStudentIndex].courses = JSON.stringify(newData)
        return mockData[foundStudentIndex]
      }else{
        throw new BadRequestException()
      }
    })
  }

  // ! NestJs IMPORTANT SETTINGS
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [StudentService],
      imports: [StudentEntity]
    }).overrideProvider(StudentService).useValue(mockService).compile();
    controller = module.get<StudentController>(StudentController);
  });

  // * UNIT TESTS FOR STUDENT CONTROLLER

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should return list of students', () => {
    expect(controller.getStudents()).toStrictEqual(mockData)
  });
  it('should return one student with given id', async() => {
    expect(await controller.getOneStudent({id: 1})).toStrictEqual(mockData[0])
  });
  it('should return created student', async() => {
    expect(await controller.createStudent(createMockDto)).toStrictEqual({
      "firstName": randomName,
      "lastName": randomSurename,
      "age": randomAge,
      "login": randomLogin,
      "password": randomPassword
  })
  });
  it('should return updated student', async() => {
    expect(await controller.updateStudent(updateMockDto, {id: 1})).toStrictEqual(
    { 
      "id": 1,
      ...updateMockDto, 
      "login": "boburbek4274", 
      "password": "bob123",
      "loginAt": "Fri Sep 09 2022 15:08:37 GMT+0500 (Uzbekistan Standard Time)",
      "isOnline": false,
      "createdAt": "2022-09-09T10:08:37.178Z",
      "courses": "[]"
    })
  });
  
  
  it('should return logined student', async() => {
    expect(await controller.login({
      "login": "boburbek4274", 
      "password": "bob123"
  })).toStrictEqual({
    "id": 1,
    ...updateMockDto,
    "login": "boburbek4274",
    "password": "bob123",
    "loginAt": "Fri Sep 09 2022 15:08:37 GMT+0500 (Uzbekistan Standard Time)",
    "isOnline": true,
    "createdAt": "2022-09-09T10:08:37.178Z",
    "courses": "[]"
  })
  });
  
  
  it('should return logouted student', async() => {
    expect(await controller.logOut({id: 1})).toStrictEqual({
      "id": 1,
      ...updateMockDto,
      "login": "boburbek4274",
      "password": "bob123",
      "loginAt": "Fri Sep 09 2022 15:08:37 GMT+0500 (Uzbekistan Standard Time)",
      "isOnline": false,
      "createdAt": "2022-09-09T10:08:37.178Z",
      "courses": "[]"
    })
  });
  
  
  it('should return student which purchased new course', async() => {
    expect(await controller.purchaseCourse({id: 1}, { "id": 4 })).toStrictEqual({
      "id": 1,
      ...updateMockDto,
      "login": "boburbek4274",
      "password": "bob123",
      "loginAt": "Fri Sep 09 2022 15:08:37 GMT+0500 (Uzbekistan Standard Time)",
      "isOnline": false,
      "createdAt": "2022-09-09T10:08:37.178Z",
      "courses": "[4]"
    })
  });


   it('should return NOT_FOUND Exception', async() => {
    expect(controller.getOneStudent({id: 12})).rejects.toThrow(NotFoundException)
  });
  it('should return BAD_REQUEST exception', async() => {
    expect(controller.updateStudent(updateMockDto, {id: 12})).rejects.toThrow(BadRequestException)
  });
  it('should return Unauthorized exception', async() => {
    expect(controller.login({
      "login": "boburbek427423",
      "password": "bob12434323"
  })).rejects.toThrow(UnauthorizedException)
  });
  it('should return BAD_REQUEST status code', async() => {
    expect(controller.logOut({id: 12})).rejects.toThrow(BadRequestException)
  });
  it('should return BAD_REQUEST status code', async() => {
    expect(controller.purchaseCourse({id: 12}, { "id": 4 })).rejects.toThrow(BadRequestException)
  });
});
