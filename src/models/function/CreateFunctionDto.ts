import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateFunctionDto {
  @IsUrl()
  @IsNotEmpty()
  workerServerUrl!: string;

  @IsString()
  @IsNotEmpty()
  functionUuid!: string;
}
