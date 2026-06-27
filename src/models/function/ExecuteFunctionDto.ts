import { ApiProperty } from '@nestjs/swagger';

export class ExecuteFunctionDto {
  @ApiProperty({
    description: 'Headers as key-value object',
    example: { 'Content-Type': 'application/json' },
    required: false,
  })
  headers?: Record<string, string>;

  @ApiProperty({
    description: 'Headers as list of key-value pairs',
    example: [{ key: 'Content-Type', value: 'application/json' }],
    type: [Object],
    required: false,
  })
  headerList?: { key: string; value: string }[];

  @ApiProperty({
    description: 'Query parameters as key-value object',
    example: { param1: 'value1', param2: 'value2' },
    required: false,
  })
  query?: Record<string, string>;

  @ApiProperty({
    description: 'Query parameters as list of key-value pairs',
    example: [{ key: 'param1', value: 'value1' }],
    type: [Object],
    required: false,
  })
  queryList?: { key: string; value: string }[];
}
