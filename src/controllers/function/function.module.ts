import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionEntity } from '../../database/entities/function.entity.js';
import { FunctionController } from './function.controller.js';
import { FunctionExecuteController } from './function.execute.controller.js';
import { FunctionService } from './function.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionEntity])],
  controllers: [FunctionController, FunctionExecuteController],
  providers: [FunctionService],
  exports: [FunctionService],
})
export class FunctionModule {}
