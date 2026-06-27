import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CreateFunctionDto } from '../../models/function/CreateFunctionDto.js';
import { FunctionDto } from '../../models/function/FunctionDto.js';
import { FunctionService } from './function.service.js';

@Controller('functions')
export class FunctionController {
  constructor(private readonly functionService: FunctionService) {}

  @Post()
  async createFunction(@Body() dto: CreateFunctionDto): Promise<FunctionDto> {
    return this.functionService.createFunction(dto);
  }

  @Get()
  async listFunctions(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 25,
  ): Promise<{ data: FunctionDto[]; total: number }> {
    return this.functionService.listFunctions(page, pageSize);
  }

  @Get('/:functionId')
  async getFunction(@Param('functionId') functionId: string): Promise<FunctionDto> {
    return this.functionService.getFunction(functionId);
  }

  @Delete('/:functionId')
  async deleteFunction(@Param('functionId') functionId: string): Promise<void> {
    return this.functionService.deleteFunction(functionId);
  }
}
