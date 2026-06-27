import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decodeJwt } from 'jose';

interface FunctionWorkerConfig {
  type: string;
  url: string;
  auth: {
    type: string;
    token_endpoint: string;
    client_id: string;
    client_secret: string;
  };
}

interface AccessTokenCache {
  accessToken: string;
  expirationTime: number;
}

@Injectable()
export class FunctionWorkerAuthService {
  private readonly logger = new Logger(FunctionWorkerAuthService.name);
  private accessTokenCache: AccessTokenCache | undefined = undefined;

  constructor(private readonly configService: ConfigService) {}

  public async getAccessToken(): Promise<string> {
    // Check cache with 60 second buffer
    if (
      this.accessTokenCache &&
      this.accessTokenCache.expirationTime > Date.now() - 60 * 1000
    ) {
      return this.accessTokenCache.accessToken;
    }

    const config = this.configService.get<FunctionWorkerConfig>('function_worker');
    if (!config?.auth) {
      throw new Error('Function worker auth configuration not found');
    }

    const requestBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.auth.client_id,
      client_secret: config.auth.client_secret,
    });

    const response = await fetch(config.auth.token_endpoint, {
      method: 'POST',
      body: requestBody,
    });

    if (!response.ok) {
      this.logger.error('Could not get access token for function worker', {
        statusCode: response.status,
      });
      throw new Error('Could not get access token for function worker');
    }

    const body = (await response.json()) as { access_token?: string };
    const accessToken = body.access_token;

    if (!accessToken) {
      throw new Error('No access token in response');
    }

    // Decode JWT to get expiration time
    const claims = decodeJwt(accessToken);
    const expirationTime = new Date(claims.exp! * 1000).getTime();

    this.accessTokenCache = {
      accessToken,
      expirationTime,
    };

    return accessToken;
  }
}
