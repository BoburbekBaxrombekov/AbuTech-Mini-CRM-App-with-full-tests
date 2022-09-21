import { HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { createDto } from './../dto/create.dto';
import { updateDto } from '../dto/update.dto';
import { LessonEntity } from './../lesson.entity';
import { LessonService } from './../lesson_service/lesson.service';
import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
const { uniqueNamesGenerator, names, NumberDictionary, adjectives, languages } = require('unique-names-generator');
import * as fs from 'fs';
const streamBuffers = require('stream-buffers');

describe('LessonController', () => {
  let controller: LessonController;
  const invalidNumber = Math.random()
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
  const mockData = [
    {
        "id": 1,
        "name": "Name",
        "duration": "1:16",
        "video": "uploads/58effe0ab12b8a71219b7c79bc1511ba",
        "teacherName": "Someone",
        "courseId": 2,
        "createdAt": "2022-09-10T17:59:27.703Z"
    },
    {
        "id": 2,
        "name": "Name",
        "duration": "1:16",
        "video": "uploads/347c7f5b3099b24b1a78871cc7c2047f",
        "teacherName": "Someone",
        "courseId": 2,
        "createdAt": "2022-09-11T05:11:40.913Z"
    }
]

const createMockDto = {
  "name": randomTitle,
  "duration": randomDesc,
  "video": randomPrice,
  "teacherName": randomTitle,
  "courseId": 1
}

const updateMockDto = {
  "name": randomTitle,
  "duration": randomDesc,
  "video": randomPrice,
  "teacherName": randomTitle,
  "courseId": 1
}

// ! Mock Service Creating
const mockService = {
  getAll: jest.fn().mockImplementation(async () => {
    return mockData
  }),
  getOne: jest.fn().mockImplementation(async(id) => {
    const foundLesson = mockData.find(item => item.id == id)
    if(foundLesson){
      return foundLesson
    }else{
      throw new NotFoundException()
    }
  }),
  create: jest.fn().mockImplementation(async (dto, videoName) => {
    const createdLesson = {
      name: dto.name,
      duration: dto.duration,
      video: videoName,
      teacherName: dto.teacherName,
      courseId: dto.courseId
  }
  return createdLesson
  }),
  fileToBuffer: (filename) => {
    const readStream = fs.createReadStream(filename);
    const chunks = [];
    return new Promise((resolve, reject) => {
      // Handle any errors while reading
      readStream.on('error', (err) => {
        // handle error
  
        // File could not be read
        reject(err);
      });
  
      // Listen for data
      readStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
  
      // File is done being read
      readStream.on('close', () => {
        // Create a buffer of the image from the stream
        resolve(Buffer.concat(chunks));
      });
    });
  },
  update: jest.fn().mockImplementation( async (dto:updateDto, id:number) => {
    const foundLesson = mockData.find(item => item.id == id)
    
    if(foundLesson){
      foundLesson.name = dto.name,
      foundLesson.duration = dto.duration,
      foundLesson.teacherName = dto.teacherName,
      foundLesson.video = dto.video,
      foundLesson.courseId = dto.courseId
      return foundLesson
    }else{
      throw new BadRequestException()
    }
  }),
  delete: jest.fn().mockImplementation(async (id:number) => {
    const foundLesson = mockData.find(item => item.id == id)
    if(foundLesson){
      const newData = mockData.splice(id, 1)
      return newData
    }else{
      throw new BadRequestException()
    }
  })
  
}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [LessonService],
      imports: [LessonEntity]
    }).overrideProvider(LessonService).useValue(mockService).compile();
    controller = module.get<LessonController>(LessonController);
  });

  it('should be defined [ BASIC ]', () => {
    expect(controller).toBeDefined();
  });
  
  it('should return list of Lessons [ FIND ALL ]', async() => {
    expect(await controller.getAllLessons()).toStrictEqual(mockData);
  });
  
  it('should return found Lesson [ FIND ONE ]', async() => {
    expect(await controller.getOneLesson({id: 1})).toStrictEqual(mockData[0]);
  });
  
  it('should return NotFoundException [ FIND ONE ]', async() => {
    expect(controller.getOneLesson({id: invalidNumber})).rejects.toThrow(NotFoundException)
  });
  
  it('should return created Lesson [ CREATE ]', async() => {
    const imageBuffer = (await mockService.fileToBuffer(
      __dirname + '/4e628131e10fe4f4420d0ca6ecacb441',
    )) as Buffer;
    const imageFiles: Express.Multer.File[] = [];
        const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
          frequency: 10, // in milliseconds.
          chunkSize: 2048, // in bytes.
        });
        myReadableStreamBuffer.put(imageBuffer as Buffer);
        imageFiles.push({
          buffer: imageBuffer,
          fieldname: 'fieldname-defined-in-@UseInterceptors-decorator',
          originalname: '4e628131e10fe4f4420d0ca6ecacb441',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'destination-path',
          filename: "file_name",
          path: 'file-path',
          size: 955578,
          stream: myReadableStreamBuffer,
        });
        
    expect(await controller.createLesson(createMockDto, imageFiles[0])).toStrictEqual({
      courseId: 1,
      duration: createMockDto.duration,
      name: createMockDto.name,
      teacherName: createMockDto.teacherName,
      video: `uploads/file_name`
    });
  });
  
  it('should return updated Lesson [ UPDATE ]', async() => {
    const imageBuffer = (await mockService.fileToBuffer(
      __dirname + '/4e628131e10fe4f4420d0ca6ecacb441',
    )) as Buffer;
    const imageFiles: Express.Multer.File[] = [];
        const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
          frequency: 10, // in milliseconds.
          chunkSize: 2048, // in bytes.
        });
        myReadableStreamBuffer.put(imageBuffer as Buffer);
        imageFiles.push({
          buffer: imageBuffer,
          fieldname: 'fieldname-defined-in-@UseInterceptors-decorator',
          originalname: '4e628131e10fe4f4420d0ca6ecacb441',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'destination-path',
          filename: "file_name",
          path: 'file-path',
          size: 955578,
          stream: myReadableStreamBuffer,
        });
        
    expect(await controller.updateLesson(updateMockDto, {id: 1} ,imageFiles[0])).toStrictEqual({
      courseId: 1,
      duration: createMockDto.duration,
      name: createMockDto.name,
      teacherName: createMockDto.teacherName,
      video: `uploads/file_name.image/jpeg`,
      createdAt: "2022-09-10T17:59:27.703Z",
      id: 1
    });
  });
  
  it('should return BadRequestException [ UPDATE ]', async() => {
    const imageBuffer = (await mockService.fileToBuffer(
      __dirname + '/4e628131e10fe4f4420d0ca6ecacb441',
    )) as Buffer;
    const imageFiles: Express.Multer.File[] = [];
        const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
          frequency: 10, // in milliseconds.
          chunkSize: 2048, // in bytes.
        });
        myReadableStreamBuffer.put(imageBuffer as Buffer);
        imageFiles.push({
          buffer: imageBuffer,
          fieldname: 'fieldname-defined-in-@UseInterceptors-decorator',
          originalname: '4e628131e10fe4f4420d0ca6ecacb441',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'destination-path',
          filename: "file_name",
          path: 'file-path',
          size: 955578,
          stream: myReadableStreamBuffer,
        });
        
    expect(controller.updateLesson(updateMockDto, {id: invalidNumber} ,imageFiles[0])).rejects.toThrow(BadRequestException)
  });
  
  it('should return an array without entered id [ DELETE ]', async() => {
    expect(await controller.deleteLesson({id: 1})).toStrictEqual([{
      "id": 2,
      "name": "Name",
      "duration": "1:16",
      "video": "uploads/347c7f5b3099b24b1a78871cc7c2047f",
      "teacherName": "Someone",
      "courseId": 2,
      "createdAt": "2022-09-11T05:11:40.913Z"
  }]);
  });
  
  it('should return NotFoundException [ DELETE ] ', async() => {
    expect(controller.deleteLesson({id: invalidNumber})).rejects.toThrow(BadRequestException)
  });
  
  
});
