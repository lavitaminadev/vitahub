import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: { field: string; message: string }[];
  timestamp: string;
  path: string;
  requestId: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request['requestId'] || 'N/A';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: { field: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;

        if (exception instanceof BadRequestException && Array.isArray(resp.message)) {
          errors = this.formatValidationErrors(resp.message);
          message = 'Validation failed';
        } else {
          message = (resp.message as string) || exception.message;
        }

        if (resp.errors && Array.isArray(resp.errors)) {
          errors = resp.errors as { field: string; message: string }[];
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    if (!isProduction && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(statusCode).json(errorResponse);
  }

  private formatValidationErrors(
    validationErrors: unknown[],
  ): { field: string; message: string }[] {
    const result: { field: string; message: string }[] = [];

    const extractErrors = (errs: unknown[], parentPath = '') => {
      for (const err of errs) {
        const error = err as {
          property?: string;
          constraints?: Record<string, string>;
          children?: unknown[];
        };
        const fieldPath = parentPath
          ? `${parentPath}.${error.property}`
          : error.property || 'unknown';

        if (error.constraints) {
          for (const constraint of Object.values(error.constraints)) {
            result.push({ field: fieldPath, message: constraint });
          }
        }

        if (error.children && error.children.length > 0) {
          extractErrors(error.children, fieldPath);
        }
      }
    };

    extractErrors(validationErrors);
    return result;
  }
}
