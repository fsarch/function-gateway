import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ExecuteFunctionDto } from '../../models/function/ExecuteFunctionDto.js';
import { FunctionService } from './function.service.js';

@Controller('functions/:functionId/_actions')
export class FunctionExecuteController {
  constructor(private readonly functionService: FunctionService) {}

  @Post('execute')
  async executeFunction(
    @Param('functionId') functionId: string,
    @Body() dto: ExecuteFunctionDto,
    @Query('wait') wait: boolean = true,
  ): Promise<any> {
    // 1. Function aus der Datenbank holen
    const func = await this.functionService.getFunction(functionId);

    if (!func) {
      throw new NotFoundException('Function not found');
    }

    // 2. Worker-Server API aufrufen
    // Endpunkt: POST /v1/functions/{functionUuid}/executions
    // Base URL aus workerServerUrl nehmen und Pfad anhängen
    const workerUrl = func.workerServerUrl;
    const executionUrl = `${workerUrl}/v1/functions/${func.functionUuid}/executions?wait=${wait}`;

    try {
      const response = await fetch(executionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arguments: dto.arguments ?? [],
        }),
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        const errorMessage = (errorData as { message?: string }).message || response.statusText;
        throw new NotFoundException(
          `Failed to execute function: ${errorMessage}`,
        );
      }

      return response.json();
    } catch (error: any) {
      // Fehler weiterleiten
      const errorMessage = error.message;
      throw new NotFoundException(
        `Failed to execute function: ${errorMessage}`,
      );
    }
  }
}
