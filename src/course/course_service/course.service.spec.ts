import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { StudentRepository } from '../../repository/student.repository';
import { CourseRepository } from '../../repository/course.repository';
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('CourseService', () => {
  let service: CourseService;
  const invalidNumber = Math.random()
  const numberDictionary = NumberDictionary.generate({ min: 100000, max: 900000 });
   const randomName = uniqueNamesGenerator({
     dictionaries: [names]
   });
   const randomSurename = uniqueNamesGenerator({
     dictionaries: [names]
   });
   const randomPrice = uniqueNamesGenerator({
     dictionaries: [numberDictionary]
   });   
   const randomDesc = uniqueNamesGenerator({
     dictionaries: [languages, NumberDictionary, names]
   });

   const createMockDto = {
    title: randomName,
    desc: randomDesc,
    price: randomPrice,
  }
  
  const updateMockDto = {
    title: randomSurename,
    desc: randomDesc,
    price: randomPrice,
  }

   let mockData = [
    {
        "id": 1,
        "title": "Some Title 6",
        "desc": "Description",
        "price": 2000000,
        "createdAt": "2022-09-16T12:39:02.928Z"
    }
  ]
   
let mockStudentData = [
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
      courses: "[1]"
  }
]



  const mockStudentRepository = {
    customFindOne: jest.fn().mockImplementation(async(id) => {
      const list = mockStudentData.find(item => item.id == id)
      if(list != undefined){
        return [list]
      }else{
        return []
      }
    })
  }
  
  const mockCourseRepository = {
    customFindAll: jest.fn().mockImplementation(() => mockData),
    customFindOne: jest.fn().mockImplementation((id) => {
      const foundCourse = mockData.find(item => item.id == id)
      if(foundCourse){
        return [foundCourse]
      }else{
        return []
      }
    }),
    customSave: jest.fn().mockImplementation(user => Promise.resolve({id: Date.now(), ...user})),
    customUpdate: jest.fn().mockImplementation(async(id, dto) => {
      const foundCourse = mockData.find(item => item.id == id)
      if(foundCourse){
        let count = 3
        dto.title ? foundCourse.title = dto.title : count - 1
        dto.desc ? foundCourse.desc = dto.desc : count - 1
        dto.price ? foundCourse.price = dto.price : count - 1
        return {affected: count}
      }else{
        return {affected: 0}
      }
    }),
    customDelete: jest.fn().mockImplementation(async(id) => {
      const foundCourse = mockData.findIndex(item => item.id == id)
      if(foundCourse >= 0){
        mockData.splice(id, 1)
        return {affected: 1}
      }else{
        return {affected: 0}
      }
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService, {
        provide: StudentRepository,
        useValue: mockStudentRepository
      }, {
        provide: CourseRepository,
        useValue: mockCourseRepository
      }],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined [ BASIC ]', () => {
    expect(service).toBeDefined();
  });
  
  it('should return list of courses [ FIND ALL ]', async() => {
    expect(await service.getAll()).toStrictEqual(mockData)
  });
  
  it('should return found course [ FIND ONE ]', async() => {
    expect(await service.getOne(1)).toStrictEqual(mockData)
  });
  
  it('should return NotFoundException [ FIND ONE ]', async() => {
    expect(service.getOne(invalidNumber)).rejects.toThrow(NotFoundException)
  });
  it('should return purchased courses of student [ PURCHASED COURSES ]', async() => {
    expect(await service.getPurchase(1)).toStrictEqual(mockData)
  });
  it('should return NotFoundException [ PURCHASED COURSES ]', async() => {
    expect(service.getPurchase(invalidNumber)).rejects.toThrow(NotFoundException)
  });
  
  it('should return created course [ CREATE ]', async() => {
    expect(await service.create(createMockDto)).toStrictEqual({id: expect.any(Number), ...createMockDto})
  });
  
  it('should return updated course [ UPDATE ]', async() => {
    expect(await service.update(1, updateMockDto)).toStrictEqual([{id: 1, ...updateMockDto, createdAt: expect.any(String)}])
  });
  
  it('should return BadRequestException [ UPDATE ]', async() => {
    expect(service.update(invalidNumber, updateMockDto)).rejects.toThrow(BadRequestException)
  });
  
  it('should return list without entered ID [ DELETE ]', async() => {
    expect(await service.deleteCourse(1)).toBe(202)
  });
  
  it('should return BadRequestException [ DELETE ]', async() => {
    expect(service.deleteCourse(invalidNumber)).rejects.toThrow(BadRequestException)
  });
});
