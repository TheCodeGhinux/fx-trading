import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsString()
  email: string
  
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  first_name: string

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  last_name: string

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description:
      'User password (min 8 chars, must include uppercase, lowercase, number, and special character)',
  })
  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  password: string
}

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsString()
  email: string

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description:
      'User password',
  })
  @IsString()
  password: string
}
