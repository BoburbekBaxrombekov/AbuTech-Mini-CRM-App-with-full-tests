import { IsNotEmpty } from 'class-validator';
export class loginDto{
    @IsNotEmpty()
    login: string;

    @IsNotEmpty()
    password: string;
}