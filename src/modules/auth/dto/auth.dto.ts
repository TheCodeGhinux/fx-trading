import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { CreateWalletDto } from "src/modules/wallet/dto/create-wallet.dto";


export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

class BaseUserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: true })
  is_email_verified: boolean;

  @ApiProperty({ example: '2025-03-25T15:09:19.472Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-03-25T15:09:19.472Z' })
  updated_at: Date;
}

class UserWithWalletResponseDto extends BaseUserResponseDto {
  @ApiProperty({
    example: [
      {
        id: '1b87b5af-0f39-4541-a14b-142843fbce8e',
        created_at: '2025-03-17T23:05:48.330Z',
        updated_at: '2025-03-17T23:05:48.330Z',
      },
    ],
  })
  wallet: CreateWalletDto;


  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDk2ZjBiMC02MzI1LTRiZWMtYjVjZi0zZmVmYWYxOTA5YjEiLCJlbWFpbCI6ImdyYWV5eXlAZ21haWwuY29tIiwiaWF0IjoxNzQyOTIwNTA5LCJleHAiOjE3NDI5MjQxMDl9.z-TVydYYr47sexM0quxixe3afr5V5d9c7B5utL-4F4I',
  })
  access_token: string;
}

class AuthDataResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2OTg3MzQ1NjksImV4cCI6MTY5ODczODE2OX0.ValidJWTToken',
  })
  access_token: string;

  @ApiProperty({ type: UserWithWalletResponseDto })
  user: UserWithWalletResponseDto;
}

class RegisterDataResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2OTg3MzQ1NjksImV4cCI6MTY5ODczODE2OX0.ValidJWTToken',
  })
  token: string;

  @ApiProperty({ type: BaseUserResponseDto })
  user: BaseUserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User created successfully' })
  message: string;

  @ApiProperty({ type: RegisterDataResponseDto })
  data: RegisterDataResponseDto;
}

export class VerifyEmailResponseDto {
  @ApiProperty({
    example: 'Email verified successfully. Redirecting to login...',
  })
  message: string;

  @ApiProperty({ type: RegisterDataResponseDto })
  redirectUrl: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'User logged in successfully' })
  message: string;

  @ApiProperty({ type: AuthDataResponseDto })
  data: AuthDataResponseDto;
}

export class BadRequestResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: 'User already exists',
    description: 'Error message describing the issue',
    oneOf: [
      { example: 'User already exists' },
      { example: 'User creation failed' },
      { example: 'Invalid or expired invitation token' },
      { example: 'Google authentication failed' },
    ],
  })
  message: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
    example: 'Invalid login credentials',
    description: 'Authentication error message',
    oneOf: [
      { example: 'Invalid login credentials' },
      { example: 'Please use Google login for this account' },
      { example: 'Invalid credentials' },
    ],
  })
  message: string;
}
