import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FunctionModule } from './controllers/function/function.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FunctionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
