import { IsEmail, IsNotEmpty } from 'class-validator';
export class createDto{
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    age: number;

    @IsNotEmpty()
    login: string

    @IsNotEmpty()
    password: string
}