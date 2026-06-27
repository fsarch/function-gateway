import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FunctionTypeEntity } from './function.type.entity.js';

@Entity({
  name: 'function',
})
export class FunctionEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__function',
  })
  id!: string;

  @Column({
    name: 'function_uuid',
    type: 'varchar',
    length: '256',
    nullable: false,
  })
  functionUuid!: string;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: '256',
    nullable: true,
  })
  externalId!: string | null;

  @Column({
    name: 'function_type_id',
    type: 'uuid',
    nullable: true,
  })
  functionTypeId!: string | null;

  @ManyToOne(() => FunctionTypeEntity, (type) => type.id)
  @JoinColumn({ name: 'function_type_id' })
  functionType!: FunctionTypeEntity | null;

  @CreateDateColumn({
    name: 'creation_time',
  })
  creationTime!: Date;

  @DeleteDateColumn({
    name: 'deletion_time',
  })
  deletionTime!: Date | null;
}
