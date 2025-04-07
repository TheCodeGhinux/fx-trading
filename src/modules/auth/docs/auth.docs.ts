import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiBody, ApiResponse, ApiBadRequestResponse } from "@nestjs/swagger";
import { CreateUserDto } from "src/modules/user/dto/create-user.dto";
import { BadRequestResponseDto, RegisterResponseDto } from "../dto/auth.dto";

export class AuthDocs {
  static register() {
    return applyDecorators(
      ApiOperation({ summary: 'User Register' }),
      ApiBody({ type: CreateUserDto }),
      ApiResponse({
        status: 201,
        description:
          'User created successfully. Please check your email for verification',
        type: RegisterResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'User already exists or invalid request parameters',
        type: BadRequestResponseDto,
      }),
      ApiBadRequestResponse({
        example: {
          message: 'Bad Request',
          success: false,
        },
      }),
    );
  }
}