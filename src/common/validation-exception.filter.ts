import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus();
    let exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      exceptionResponse = { message: exceptionResponse };
    }

    response.status(status).json({
      ...exceptionResponse,
    });
  }
}
