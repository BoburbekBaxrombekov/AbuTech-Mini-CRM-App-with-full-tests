import { CourseRepository } from './../../repository/course.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LessonRepository } from './../../repository/lesson.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from './lesson.service';
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('LessonService', () => {
  let service: LessonService;

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
   
   const randomTeacher = uniqueNamesGenerator({
     dictionaries: [adjectives]
   });
   
   const randomURL = uniqueNamesGenerator({
     dictionaries: [languages, NumberDictionary, names]
   });

   let mockData = [
    {
        "id": 1,
        "name": "Name",
        "duration": "1:16",
        "video": "uploads/f07133cb31d444152d02312878731e2d",
        "teacherName": "Someone",
        "courseId": 1,
        "createdAt": "2022-09-19T05:15:49.603Z"
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
   
  const createMockDto = {
    name: randomName,
    duration: randomSurename,
    teacherName: randomTeacher
  }
  
  const updateMockDto = {
    name: randomName,
    duration: randomSurename,
    video: randomURL,
    teacherName: randomTeacher
  }

  const mockRepository = {
    customFindAll: jest.fn().mockImplementation(() => mockData),
    customFindOne: jest.fn().mockImplementation((id) => {
      const list = mockData.find(item => item.id == id)
      if(list != undefined){
        return [list]
      }else{
        return []
      }
    }),
    customSave: jest.fn().mockImplementation(dto => Promise.resolve({id: Date.now(), ...dto, createdAt: Date()})),
    customUpdate: jest.fn().mockImplementation(async(id, dto) => {
      const foundStudent = mockData.find(item => item.id == id)
      if(foundStudent){
        let count = 5
        dto.name ? foundStudent.name = dto.name : count - 1
        dto.duration ? foundStudent.duration = dto.duration : count - 1
        dto.video ? foundStudent.video = dto.video : count - 1
        dto.teacherName ? foundStudent.teacherName = dto.teacherName : count - 1
        dto.courseId ? foundStudent.courseId = dto.courseId : count - 1
        return {affected: count}
      }else{
        return {affected: 0}
      }
    }),
    customDelete: jest.fn().mockImplementation(async(id) => {
      const foundStudent = mockData.findIndex(item => item.id == id)
      if(foundStudent >= 0){
        return {affected: 1}
      }else{
        return {affected: 0}
      }
    })
  }
  
  const mockCourseRepository = {
    customFindOne: jest.fn().mockImplementation((id) => {
      const list = mockCourseData.find(item => item.id == id)
      if(list != undefined){
        return [list]
      }else{
        return undefined
      }
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonService, {
        provide: LessonRepository,
        useValue: mockRepository
      }, {
        provide: CourseRepository,
        useValue: mockCourseRepository
      }],
    }).compile();

    service = module.get<LessonService>(LessonService);
  });

  it('should be defined [ BASIC ]', () => {
    expect(service).toBeDefined();
  });
  
  it('should return list of lessons [ FIND ALL ]', async() => {
    expect(await service.getAll()).toStrictEqual(mockData)
  });
  
  it('should return found lesson [ FIND ONE ]', async() => {
    expect(await service.getOne(1)).toStrictEqual(mockData)
  });
  
  it('should return NotFoundException [ FIND ONE ]', async() => {
    expect(service.getOne(invalidNumber)).rejects.toThrow(NotFoundException)
  });
  
  it('should return created lesson [ CREATE ]', async() => {
    expect(await service.create({
      ...createMockDto,
      courseId: 1
    }, randomURL)).toStrictEqual({
      id: expect.any(Number),
      ...createMockDto,
      courseId: 1,
      createdAt: expect.any(String),
      video: randomURL
    })
  });
  
  it('should return updated lesson [ UPDATE ]', async() => {
    expect(await service.update({
      ...updateMockDto,
      courseId: 2
    }, 1)).toStrictEqual([{
      id: expect.any(Number),
      ...updateMockDto,
      courseId: 2,
      createdAt: expect.any(String),
      video: randomURL
    }])
  });
  
  it('should return BadRequestException [ UPDATE ]', () => {
    expect(service.update({
      ...updateMockDto,
      courseId: 1
    }, invalidNumber)).rejects.toThrow(BadRequestException)
  });
  it('should return Accepted status code [ DELETE ]', async() => {
    expect(await service.delete(1)).toBe(202)
  });
  it('should return BadRequestException [ DELETE ]', () => {
    expect(service.delete(invalidNumber)).rejects.toThrow(BadRequestException)
  });
});
