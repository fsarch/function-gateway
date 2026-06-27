import {
  Controller,
  All,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@fsarch/server/auth';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { FunctionService } from './function.service.js';
import { FunctionWorkerAuthService } from '../../services/function-worker/function-worker.auth.service.js';
import { ConfigService } from '@nestjs/config';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller('functions/:functionId/_actions')
export class FunctionExecuteController {
  constructor(
    private readonly functionService: FunctionService,
    private readonly functionWorkerAuthService: FunctionWorkerAuthService,
    private readonly configService: ConfigService,
  ) {}

  @All('execute')
  async executeFunction(
    @Req() request: Request,
    @Param('functionId') functionId: string,
  ): Promise<any> {
    // 1. Function aus der Datenbank holen
    const func = await this.functionService.getFunction(functionId);

    if (!func) {
      throw new NotFoundException('Function not found');
    }

    // 2. Access Token für Function Worker holen
    const accessToken = await this.functionWorkerAuthService.getAccessToken();

    // 3. Function Worker URL aus Config lesen
    const functionWorkerUrl = this.configService.get<string>('function_worker.url');
    if (!functionWorkerUrl) {
      throw new NotFoundException('Function worker URL not configured');
    }

    // Endpunkt: POST /v1/functions/{functionId}/executions
    const executionUrl = `${functionWorkerUrl}/v1/functions/${func.functionId}/executions?wait=true`;

    // Extrahiere HTTP-Methode aus dem Request
    const method = request.method;

    // Extrahiere Header aus dem Request und füge Content-Type hinzu
    const requestHeaders = request.headers as Record<string, string | string[]>;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.entries(requestHeaders).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(',') : value;
        return acc;
      }, {} as Record<string, string>),
    };

    // Konvertiere Header in headerList Format
    const headerList = Object.entries(headers).map(([key, value]) => ({
      key,
      value,
    }));

    // Extrahiere Query-Parameter aus dem Request
    const query: Record<string, string> = {};
    const requestQuery = request.query as Record<string, string | string[] | undefined>;
    Object.entries(requestQuery).forEach(([key, value]) => {
      if (value !== undefined) {
        query[key] = Array.isArray(value) ? value.join(',') : String(value);
      }
    });

    // Konvertiere Query-Parameter in queryList Format
    const queryList = Object.entries(query).map(([key, value]) => ({
      key,
      value,
    }));

    try {
      const response = await fetch(executionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          arguments: [{
            method,
            headers,
            headerList,
            query,
            queryList,
          }],
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
