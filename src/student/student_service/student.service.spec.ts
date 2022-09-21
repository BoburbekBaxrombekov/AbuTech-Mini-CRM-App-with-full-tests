import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { StudentRepository } from '../../repository/student.repository';
import { CourseRepository } from '../../repository/course.repository';
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('StudentService', () => {
  let service: StudentService;
  const invalidNumber = Math.random()
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
   const fakeLogin = uniqueNamesGenerator({
     dictionaries: [names]
   });
   const fakePassword = uniqueNamesGenerator({
     dictionaries: [languages, NumberDictionary, names]
   });

   let mockData = [
    {
        id: 1,
        firstName: "Boburbek",
        lastName: "Baxrombekov",
        age: 13,
        login: "boburbek4274",
        password: "bob123",
        loginAt: "Fri Sep 16 2022 16:27:07 GMT+0500 (Узбекистан, стандартное время)",
        isOnline: true,
        createdAt: "2022-09-16T11:27:07.843Z",
        courses: "[]"
    }
]
   
let mockCourseData = [
  {
      "id": 1,
      "title": "Some Title 6",
      "desc": "Description",
      "price": 2000000,
      "createdAt": "2022-09-16T12:39:02.928Z"
  }
]


  const mockStudentRepository = {
    customFindAll: jest.fn().mockImplementation(() => mockData),
    customFindOne: jest.fn().mockImplementation((id) => {
      const list = mockData.find(item => item.id == id)
      if(list != undefined){
        return [list]
      }else{
        return []
      }
    }),
    customSave: jest.fn().mockImplementation(user => Promise.resolve({id: Date.now(), ...user})),
    customUpdate: jest.fn().mockImplementation(async(id, dto) => {
      const foundStudent = mockData.find(item => item.id == id)
      if(foundStudent !== undefined){
        let count = 3
        dto.firstName ? foundStudent.firstName = dto.firstName : count - 1
        dto.lastName ? foundStudent.lastName = dto.lastName : count - 1
        dto.age ? foundStudent.age = dto.age : count - 1
        return {affected: count}
      }else{
        return {affected: 0}
      }
    }),
    customDelete: jest.fn().mockImplementation(async(id) => {
      const foundStudent = mockData.findIndex(item => item.id == id)
      if(foundStudent !== undefined){
        if(foundStudent >= 0){
          return {affected: 1}
        }else{
          return {affected: 0}
        }
      }
    }),
    customLogin: jest.fn().mockImplementation(async(login, password) => {
      const foundStudent = mockData.find(item => {
        if(item.login == login && item.password == password){
          return item
        }
      })
      if(foundStudent !== undefined){
        return foundStudent
      }
      
    }),
  }
  
  const mockCourseRepository = {
    customFindOne: jest.fn().mockImplementation((id) => {
      const foundCourse = mockCourseData.find(item => item.id == id)
      if(foundCourse !== undefined){
        return [foundCourse]
      }else{
        return []
      }
    }),
  }

  const createMockDto = {
    firstName: randomName,
    lastName: randomSurename,
    age: randomAge,
    login: randomLogin,
    password: randomPassword
  }
  
  const updateMockDto = {
    firstName: randomName,
    lastName: randomSurename,
    age: randomAge
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentService, {
        provide: StudentRepository,
        useValue: mockStudentRepository
      }, {
        provide: CourseRepository,
        useValue: mockCourseRepository
      },],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should return created student', async() => {
    expect( await service.create(createMockDto)).toStrictEqual({
      id: expect.any(Number),
      ...createMockDto,
      isOnline: true,
      loginAt: expect.any(String)
    });
  });
 
  it('should return list of student [ FIND ALL ]', async() => {
    expect( await service.findAll() ).toStrictEqual(mockData);
  });
  
  it('should return found student [ FIND ONE ]', async() => {
    expect(await service.findOne(1)).toStrictEqual(mockData);
  });
  
  it('should return NOT_FOUND exception [ FIND ONE ]', async() => {
    expect(service.findOne(invalidNumber)).rejects.toThrow(NotFoundException)
  });
  
  it('should return created student [ CREATE ]', async() => {
    expect(await service.create(createMockDto)).toStrictEqual(
      {
        id: expect.any(Number), 
        ...createMockDto,
        isOnline: expect.any(Boolean), 
        loginAt: expect.any(String)
      }
    )
  });
  
  it('should return updated student [ UPDATE ]', async() => {
    expect(await service.update(updateMockDto, 1)).toStrictEqual(
      [{
        id: expect.any(Number), 
        ...updateMockDto,
        login: expect.any(String),
        password: expect.any(String),
        isOnline: expect.any(Boolean), 
        loginAt: expect.any(String),
        courses: expect.any(String),
        createdAt: expect.any(String)
      }]
    )
  });
  it('should return BAD_REQUEST exception [ UPDATE ]', async() => {
    expect(service.update(updateMockDto, invalidNumber)).rejects.toThrow(BadRequestException)
  });
  
  it('should return ACCEPTED status code(202) [ DELETE ]', async() => {
    expect(await service.remove(1)).toBe(202)
  });

  it('should return BAD_REQUEST exception [ DELETE ]', async() => {
    expect(service.remove(invalidNumber)).rejects.toThrow(BadRequestException)
  });
  
  it('should return logined Student [ LOGIN ]', async() => {
    expect(await service.login("boburbek4274", "bob123")).toStrictEqual(mockData[0])
  });
  
  it('should return UnauthorizedException [ LOGIN ]', async() => {
    expect(service.login(fakeLogin, fakePassword)).rejects.toThrow(UnauthorizedException)
  });
  
  it('should return ACCEPTED status code [ LOG OUT ]', async() => {
    expect(await service.logOut(1)).toBe(202)
  });
  
  it('should return BAD_REQUEST status code [ LOG OUT ]', async() => {
    expect(service.logOut(invalidNumber)).rejects.toThrow(BadRequestException)
  });
  
  it('should return purchased student [ PURCHASE COURSE ]', async() => {
    expect(await service.purchaseCourse(1, 1)).toStrictEqual(mockData)
  });
  
  it('should return BAD_REQUEST exception [ PURCHASE COURSE ]', async() => {
    expect(service.purchaseCourse(1, invalidNumber)).rejects.toThrow(BadRequestException)
  });
});
