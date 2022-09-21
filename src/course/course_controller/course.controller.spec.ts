import { updateDto } from './../dto/update.dto';
import { createDto } from './../dto/create.dto';
import { HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseEntity } from './../course.entity';
import { CourseService } from './../course_service/course.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');

describe('CourseController', () => {
  let controller: CourseController;

  // ! Generator SETTINGS
  const numberDictionary = NumberDictionary.generate({ min: 100000, max: 10000000 });
  const randomTitle = uniqueNamesGenerator({
    dictionaries: [names, adjectives, languages]
  });
  const randomDesc = uniqueNamesGenerator({
    dictionaries: [names, adjectives, languages]
  });
  const randomPrice = uniqueNamesGenerator({
    dictionaries: [numberDictionary]
  });

  // ! Mock Data and Dto
  const studentMockData = [
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
        "courses": "[1]"
    },
    {
        "id": 2,
        "firstName": "Boburbek 2",
        "lastName": "Baxrombekov 2",
        "age": 13,
        "login": "boburbek4274",
        "password": "bob123",
        "loginAt": "Fri Sep 09 2022 15:08:37 GMT+0500 (Uzbekistan Standard Time)",
        "isOnline": false,
        "createdAt": "2022-09-09T10:08:37.178Z",
        "courses": "[]"
    }
  ]

  const mockData = [
    {
        "id": 1,
        "title": "Some Title",
        "desc": "Description",
        "price": 2000000,
        "createdAt": "2022-09-09T14:14:45.946Z"
    }
]

const createMockDto = {
  "title": randomTitle,
  "desc": randomDesc,
  "price": randomPrice,
}

// ! Mock Service Creating
const mockService = {
  getAll: jest.fn().mockImplementation(() => mockData),
  getOne: jest.fn().mockImplementation(async(id) => {
    const foundCourse = await mockData.find(item => item.id == id)
    if(foundCourse != undefined){
      return foundCourse
    }else{
      throw new NotFoundException()
    }
  }),
  getPurchase: jest.fn().mockImplementation(async(id:number) => {
    const foundStudent = studentMockData.find(item => item.id == id)
    if(foundStudent){
      const coursesListOfStudent = JSON.parse(foundStudent.courses)
      if(coursesListOfStudent.length >= 1){
        const newData = []
        for(let i = 0; i < coursesListOfStudent.length; i++){
          const foundCourse = mockData.find(course => course.id == coursesListOfStudent[i])
          newData.push(foundCourse)
        }
        return newData
      }else{
        return []
      }
    }else{
      throw new NotFoundException()
    }
  }),
  create: jest.fn().mockImplementation( async (dto: createDto) => dto),
  update: jest.fn().mockImplementation( async (id:number, dto: updateDto) => {
    const foundCourse = mockData.find(item => item.id == id)
    if(foundCourse){
        dto.title ? foundCourse.title = dto.title : ""
        dto.desc ? foundCourse.desc = dto.desc : ""
        dto.price ? foundCourse.price = dto.price : ""
        return foundCourse
    }else{
      throw new BadRequestException()
    }
  }),
  deleteCourse: jest.fn().mockImplementation(async (id:number) => {
    const foundCourse = mockData.find(item => item.id == id)
    if(foundCourse){
      return mockData.splice(id, 1)
    }else{
      throw new BadRequestException()
    }
  })
  
}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [CourseService],
      imports: [CourseEntity]
    }).overrideProvider(CourseService).useValue(mockService).compile();

    controller = module.get<CourseController>(CourseController);
  });



  // * UNIT TESTS FOR STUDENT CONTROLLER

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should return list of Courses [ FIND ALL ]', () => {
    expect(controller.getAll()).toStrictEqual(mockData);
  });
  it('should return course by id [ FIND ONE ]', async() => {
    expect(await controller.getOneCourse({id: 1})).toStrictEqual(mockData[0]);
  });
  it('should return NotFoundException [ FIND ONE ]', async() => {
    expect(controller.getOneCourse({id: 12})).rejects.toThrow(NotFoundException)
  });
  
  it('should return list of purchased courses of student [ FIND PURCHASE ]', async() => {
    expect(await controller.getPurchaseCourseCount({id: 1})).toStrictEqual(
      [
        {
          "id": 1,
          "title": "Some Title",
          "desc": "Description",
          "price": 2000000,
          "createdAt": "2022-09-09T14:14:45.946Z"
        }
      ]
  );
  });
  
  it('should return NotFoundException [ FIND PURCHASE ]', async() => {
    expect(controller.getPurchaseCourseCount({id: 12})).rejects.toThrow(NotFoundException)
  });
  
  it('should return an empty array [ FIND PURCHASE ]', async() => {
    expect(await controller.getPurchaseCourseCount({id: 2})).toStrictEqual([]);
  });
  
  it('should return dto [ CREATE ]', async() => {
    expect(await controller.create(createMockDto)).toStrictEqual(createMockDto);
  });
  
  it('should return updated course [ UPDATE ]', async() => {
    expect(await controller.updateCourse({id: 1}, createMockDto)).toStrictEqual({
      "id": 1,
      "title": randomTitle,
      "desc": randomDesc,
      "price": randomPrice,
      "createdAt": "2022-09-09T14:14:45.946Z"
  });
  });
  
  it('should return BadRequestException [ UPDATE ]', async() => {
    expect(controller.updateCourse({id: 11}, createMockDto)).rejects.toThrow(BadRequestException)
  });
  
  it('should return list without deleted course [ DELETE ]', async() => {
    expect(await controller.deleteCourse({id: 1})).toStrictEqual([]);
  });
  
  it('should return BadRequestException [ DELETE ]', async() => {
    expect(controller.deleteCourse({id: 12})).rejects.toThrow(BadRequestException)
  });
});
