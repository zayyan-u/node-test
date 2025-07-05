import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, isString, MinLength } from 'class-validator';

export class CreateUserDto {
    
    @ApiProperty()
    @IsNotEmpty()
    username: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @MinLength(6)
    password: string;
}