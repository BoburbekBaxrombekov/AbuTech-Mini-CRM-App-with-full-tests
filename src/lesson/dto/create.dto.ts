import { IsNotEmpty } from 'class-validator';
export class createDto{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    duration: string;

    @IsNotEmpty()
    teacherName: number;

    @IsNotEmpty()
    courseId: number;
}