import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PaginationMeta } from './helpers/pagination.helper';
import { IS_PRIVATE_KEY } from 'src/decorators/private.decorator';

interface ResponseData {
  message?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
  meta?: PaginationMeta;
}

const DEFAULT_PRIVATE_FIELDS = [
  'password',
  'userId',
];

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: unknown) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: unknown, context: ExecutionContext): HttpException {
    const req = context.switchToHttp().getRequest<Request>();

    if (exception instanceof HttpException) return exception;

    const errorMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `Error processing request for ${req.method} ${req.url}, Message: ${errorMessage}, Stack: ${errorStack}`,
    );

    return new InternalServerErrorException({
      success: false,
      message: 'Internal server error',
    });
  }

  responseHandler(res: unknown, context: ExecutionContext): unknown {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const success =
      response.statusCode === 200 || response.statusCode === 201 ? true : false;

    response.setHeader('Content-Type', 'application/json');

    if (typeof res === 'object' && res !== null) {
      const { message, data, meta } = res as ResponseData;

      const processedData = data
        ? this.removePrivateFields(data, context)
        : undefined;

      return {
        success,
        message,
        data: processedData,
        meta: meta,
      };
    } else {
      return res;
    }
  }

  private removePrivateFields(
    data: unknown,
    context: ExecutionContext,
  ): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.removePrivateFields(item, context));
    }

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const result = { ...data };

    const decoratorPrivateFields =
      this.reflector.get<string[]>(IS_PRIVATE_KEY, context.getHandler()) || [];

    const privateFields = [
      ...DEFAULT_PRIVATE_FIELDS,
      ...decoratorPrivateFields,
    ];

    for (const field of privateFields) {
      delete result[field];
    }

    for (const key in result) {
      if (
        typeof result[key] === 'object' &&
        result[key] instanceof Date === false &&
        result[key] !== null
      ) {
        result[key] = this.removePrivateFields(result[key], context);
      }
    }

    return result;
  }
}