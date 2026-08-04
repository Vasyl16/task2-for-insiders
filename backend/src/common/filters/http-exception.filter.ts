import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Catches every exception that escapes a controller/service and normalizes it
 * into a single JSON shape. HttpExceptions (thrown deliberately by feature
 * code) are passed through as-is; anything else is treated as unexpected,
 * logged with its stack trace, and reported as a generic 500 so internals
 * are never leaked to the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      statusCode: status,
      message: isHttpException ? this.extractMessage(exception) : 'Internal server error',
      error: isHttpException ? exception.name : 'InternalServerError',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (!isHttpException) {
      const stack = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`Unhandled exception on ${request.method} ${request.url}`, stack);
    }

    response.status(status).json(body);
  }

  private extractMessage(exception: HttpException): string | string[] {
    const payload = exception.getResponse();
    if (typeof payload === 'string') {
      return payload;
    }
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      return (payload as { message: string | string[] }).message;
    }
    return exception.message;
  }
}
