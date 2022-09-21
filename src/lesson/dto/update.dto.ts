import { IsOptional } from 'class-validator';
export class updateDto{
    @IsOptional()
    name: string;

    @IsOptional()
    duration: string;

    @IsOptional()
    teacherName: string;

    @IsOptional()
    video: string

    @IsOptional()
    courseId: number;
}