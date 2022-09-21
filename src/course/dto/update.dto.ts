import { IsOptional } from 'class-validator';
export class updateDto{
    @IsOptional()
    title: string;

    @IsOptional()
    desc: string;

    @IsOptional()
    price: number;
}