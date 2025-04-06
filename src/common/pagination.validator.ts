import { IsOptional, IsString } from 'class-validator';

export default class PaginationValidator {
  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsString({ message: 'Limit must be a string' })
  @IsOptional()
  limit?: string;

  @IsString({ message: 'search must be a string' })
  @IsOptional()
  search?: string;
}
