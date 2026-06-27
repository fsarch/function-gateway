import {
  Controller,
  All,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ExecuteFunctionDto } from '../../models/function/ExecuteFunctionDto.js';
import { FunctionService } from './function.service.js';

@Controller('functions/:functionId/_actions')
export class FunctionExecuteController {
  constructor(
    private readonly functionService: FunctionService,
    private readonly configService: ConfigService,
  ) {}

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

    // 2. Worker-Server URL aus Config lesen
    const functionServerUrl = this.configService.get<string>('function.server');
    if (!functionServerUrl) {
      throw new NotFoundException('Function server URL not configured');
    }

    // Endpunkt: POST /v1/functions/{functionId}/executions
    const executionUrl = `${functionServerUrl}/v1/functions/${func.functionId}/executions?wait=${wait}`;

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
