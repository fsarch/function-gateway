import { ApiProperty } from '@nestjs/swagger';

export class ExecuteFunctionDto {
  @ApiProperty({
    description: 'Function arguments',
    type: [Object],
    required: false,
  })
  arguments?: any[];

  @ApiProperty({
    description: 'HTTP method to use for the function call',
    example: 'GET',
    required: false,
  })
  method?: string;

  @ApiProperty({
    description: 'Headers as key-value object',
    example: { 'Content-Type': 'application/json' },
    required: false,
  })
  headers?: Record<string, string>;

  @ApiProperty({
    description: 'Headers as array of key-value pairs',
    example: [{ key: 'Content-Type', value: 'application/json' }],
    type: [Object],
    required: false,
  })
  headerArray?: { key: string; value: string }[];
}
