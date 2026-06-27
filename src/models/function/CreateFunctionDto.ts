import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFunctionDto {
  @ApiProperty({
    description: 'ID of the function on the worker server',
    example: 'abc-123-def-456',
  })
  @IsString()
  @IsNotEmpty()
  functionId!: string;
}
