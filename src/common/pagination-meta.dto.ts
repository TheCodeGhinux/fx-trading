import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total number of records',
    type: 'number',
  })
  total: number;
  @ApiProperty({
    description: 'Total number of records per page',
    type: 'number',
  })
  limit: number;

  @ApiProperty({
    description: 'current page page',
    type: 'number',
  })
  page: number;

  @ApiProperty({
    description: 'if there is a next page',
    type: 'boolean',
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'if there is a prev page',
    type: 'boolean',
  })
  hasPrevious: boolean;

  @ApiProperty({
    description: 'total number of patges',
    type: 'number',
  })
  totalPages: number;
}
