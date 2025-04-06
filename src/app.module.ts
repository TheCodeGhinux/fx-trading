import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from 'src/database/data-source';

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useFactory: () => ({
      ...dataSource.options,
    }),
    dataSourceFactory: async () => {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      return dataSource;
    },
  }), AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
