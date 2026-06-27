export class FunctionDto {
  id!: string;
  workerServerUrl!: string;
  functionUuid!: string;
  creationTime!: Date;
  deletionTime!: Date | null;
}
