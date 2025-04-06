import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Type } from '@nestjs/common';
import { CustomHttpException } from './custom.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value) as object;

    if (object === null || typeof object !== 'object') {
      throw new CustomHttpException(
        {
          errors: {
            validation: ['Invalid input'],
          },
          message: 'Validation error',
        },
        422,
      );
    }

    const errors = await validate(object);

    if (errors.length > 0) {
      throw new CustomHttpException(
        this.transformValidationErrors(errors),
        422,
      );
    }
    return value;
  }

  private transformValidationErrors(
    errors: ValidationError[],
  ): Record<string, unknown> {
    const errorMessages = errors.map((error) => {
      return {
        [error.property]: error.constraints
          ? Object.values(error.constraints)
          : ['Unknown validation error'],
      };
    });

    const errorObject = errorMessages.reduce<Record<string, unknown>>(
      (result, currentError) => {
        return { ...result, ...currentError };
      },
      {},
    );

    return { errors: errorObject, message: 'Validation error' };
  }

  private toValidate(metatype: Type): boolean {
    const types: Type[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}