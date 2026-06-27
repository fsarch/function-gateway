import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEntity } from '../../database/entities/function.entity.js';
import { CreateFunctionDto } from '../../models/function/CreateFunctionDto.js';
import { FunctionDto } from '../../models/function/FunctionDto.js';
import crypto from 'node:crypto';

@Injectable()
export class FunctionService {
  constructor(
    @InjectRepository(FunctionEntity)
    private functionRepository: Repository<FunctionEntity>,
  ) {}

  async createFunction(dto: CreateFunctionDto): Promise<FunctionDto> {
    const id = crypto.randomUUID();

    const functionEntity = this.functionRepository.create({
      id,
      workerServerUrl: dto.workerServerUrl,
      functionUuid: dto.functionUuid,
    });

    const saved = await this.functionRepository.save(functionEntity);

    return this.mapToDto(saved);
  }

  async listFunctions(
    page: number = 1,
    pageSize: number = 25,
  ): Promise<{ data: FunctionDto[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [functions, total] = await this.functionRepository.findAndCount({
      skip,
      take: pageSize,
    });

    const data = functions.map(this.mapToDto);
    return { data, total };
  }

  async getFunction(id: string): Promise<FunctionDto> {
    const func = await this.functionRepository.findOne({
      where: { id },
    });

    if (!func) {
      throw new NotFoundException('Function not found');
    }

    return this.mapToDto(func);
  }

  async getByFunctionUuid(functionUuid: string): Promise<FunctionEntity | null> {
    return this.functionRepository.findOne({
      where: { functionUuid },
    });
  }

  async deleteFunction(id: string): Promise<void> {
    const func = await this.functionRepository.findOne({
      where: { id },
    });

    if (!func) {
      throw new NotFoundException('Function not found');
    }

    await this.functionRepository.softRemove(func);
  }

  private mapToDto(entity: FunctionEntity): FunctionDto {
    return {
      id: entity.id,
      workerServerUrl: entity.workerServerUrl,
      functionUuid: entity.functionUuid,
      creationTime: entity.creationTime,
      deletionTime: entity.deletionTime,
    };
  }
}
