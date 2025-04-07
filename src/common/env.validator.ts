import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

class EnvVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_TYPE: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_HOST: string;

  @IsString()
  DB_PORT: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_ENTITIES: string;

  @IsString()
  DB_MIGRATIONS: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_TIMEFRAME: string;

  @IsString()
  INVITE_SECRET: string;

  @IsString()
  INVITE_DURATION: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    errors.forEach((error) => {
      Object.values(error.constraints ?? {}).forEach((message) => {
        logger.error(`❌ ENV Validation Error: ${message}`);
      });
    });

    process.exit(1);
  }

  return validatedConfig;
}
