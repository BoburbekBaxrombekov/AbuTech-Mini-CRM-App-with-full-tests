import { IsOptional } from 'class-validator';
export class updateDto{
    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;

    @IsOptional()
    age: number;
}