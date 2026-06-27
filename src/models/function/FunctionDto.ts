import { ApiProperty } from '@nestjs/swagger';

export class FunctionDto {
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @ApiProperty({ description: 'ID of the function on the worker server' })
  functionId!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  creationTime!: Date;

  @ApiProperty({ description: 'Soft delete timestamp', nullable: true })
  deletionTime!: Date | null;
}
