import {
  Controller,
  All,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ExecuteFunctionDto } from '../../models/function/ExecuteFunctionDto.js';
import { FunctionService } from './function.service.js';

@Controller('functions/:functionId/_actions')
export class FunctionExecuteController {
  constructor(private readonly functionService: FunctionService) {}

  @All('execute')
  async executeFunction(
    @Req() request: Request,
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
    // Base URL aus workerServerUrl nehmen und Pfad anhaengen
    const workerUrl = func.workerServerUrl;
    const executionUrl = `${workerUrl}/v1/functions/${func.functionUuid}/executions?wait=${wait}`;

    // Extrahiere HTTP-Methode aus dem Request
    const method = dto.method ?? request.method;

    // Extrahiere Header aus dem Request und füge Content-Type hinzu
    const requestHeaders = request.headers as Record<string, string | string[]>;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.entries(requestHeaders).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(',') : value;
        return acc;
      }, {} as Record<string, string>),
      ...(dto.headers ?? {}),
    };

    // Konvertiere Header in headerArray Format
    const headerArray = Object.entries(headers).map(([key, value]) => ({
      key,
      value,
    }));

    // Füge headerArray aus dem DTO hinzu, falls vorhanden
    if (dto.headerArray) {
      headerArray.push(...dto.headerArray);
    }

    try {
      const response = await fetch(executionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arguments: dto.arguments ?? [],
          method,
          headers,
          headerArray,
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
