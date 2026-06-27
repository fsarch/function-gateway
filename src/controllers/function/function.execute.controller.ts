import {
  Controller,
  All,
  Param,
  Req,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard, Public } from '@fsarch/server/auth';
import { Request } from 'express';
import type { Response } from 'express';
import { FunctionService } from './function.service.js';
import { FunctionWorkerAuthService } from '../../services/function-worker/function-worker.auth.service.js';
import { ConfigService } from '@nestjs/config';

@UseGuards(AuthGuard)
@Public()
@Controller('functions/:functionId/http/_actions')
export class FunctionExecuteController {
  constructor(
    private readonly functionService: FunctionService,
    private readonly functionWorkerAuthService: FunctionWorkerAuthService,
    private readonly configService: ConfigService,
  ) {}

  @All('execute')
  async executeFunction(
    @Req() request: Request,
    @Res() response: Response,
    @Param('functionId') functionId: string,
  ): Promise<void> {
    // 1. Get function from database
    const func = await this.functionService.getFunction(functionId);

    if (!func) {
      throw new NotFoundException('Function not found');
    }

    // 2. Get access token for function worker
    const accessToken = await this.functionWorkerAuthService.getAccessToken();

    // 3. Get function worker URL from config
    const functionWorkerUrl = this.configService.get<string>('function_worker.url');
    if (!functionWorkerUrl) {
      throw new NotFoundException('Function worker URL not configured');
    }

    // Endpoint: POST /v1/functions/{functionId}/executions
    const executionUrl = `${functionWorkerUrl}/v1/functions/${func.functionId}/executions?wait=true`;

    // Extract HTTP method from request
    const method = request.method;

    // Extract headers from request and add Content-Type
    const requestHeaders = request.headers as Record<string, string | string[]>;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...Object.entries(requestHeaders).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(',') : value;
        return acc;
      }, {} as Record<string, string>),
    };

    // Convert headers to headerList format
    const headerList = Object.entries(headers).map(([key, value]) => ({
      key,
      value,
    }));

    // Extract query parameters from request
    const queryParams: Record<string, string> = {};
    const requestQuery = request.query as Record<string, string | string[] | undefined>;
    Object.entries(requestQuery).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = Array.isArray(value) ? value.join(',') : String(value);
      }
    });

    // Convert query parameters to queryParamList format
    const queryParamList = Object.entries(queryParams).map(([key, value]) => ({
      key,
      value,
    }));

    try {
      const workerResponse = await fetch(executionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          arguments: [{
            method,
            headers: headers,
            headerList: headerList,
            queryParams,
            queryParamList,
          }],
        }),
      });

      if (!workerResponse.ok) {
        const errorData: any = await workerResponse.json().catch(() => ({}));
        const errorMessage = (errorData as { message?: string }).message || workerResponse.statusText;
        throw new NotFoundException(
          `Failed to execute function: ${errorMessage}`,
        );
      }

      // Parse wrapped function response: { isError: boolean, result: { status: number, body: string, ... } }
      const wrappedResponse = await workerResponse.json() as {
        isError: boolean;
        result: {
          status?: number;
          statusText?: string;
          body?: string;
          headers?: Record<string, string>;
          headerList?: { key: string; value: string }[];
        };
      };

      if (wrappedResponse.isError) {
        response.status(500);
        response.send('');
        return;
      }

      // Unwrap the result
      const unwrapped = wrappedResponse.result;

      // Extract response data with defaults
      const httpStatusCode = unwrapped.status ?? 200;
      const httpStatusText = unwrapped.statusText ?? 'OK';
      const responseBody = unwrapped.body ?? '';
      const responseHeaderList = unwrapped.headerList ?? (unwrapped.headers ? Object.entries(unwrapped.headers).map(([key, value]) => ({ key, value })) : []);

      // Set response status
      response.status(httpStatusCode);

      // Set response headers (headerList takes precedence over headers)
      responseHeaderList.forEach(({ key, value }) => {
        response.setHeader(key, value);
      });

      // Send body (always as string)
      response.send(responseBody);
    } catch (error: any) {
      // Forward error
      const errorMessage = error.message;
      throw new NotFoundException(
        `Failed to execute function: ${errorMessage}`,
      );
    }
  }
}
