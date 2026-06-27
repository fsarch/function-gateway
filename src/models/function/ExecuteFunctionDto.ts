export class ExecuteFunctionDto {
  arguments?: any[];
  method?: string;
  headers?: Record<string, string>;
  headerArray?: { key: string; value: string }[];
}
