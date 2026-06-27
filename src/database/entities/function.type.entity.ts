import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'function_type',
})
export class FunctionTypeEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__function_type',
  })
  id!: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: '256',
    nullable: false,
    unique: true,
  })
  name!: string;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: '256',
    nullable: true,
    unique: true,
  })
  externalId: string | null = null;

  @CreateDateColumn({
    name: 'creation_time',
  })
  creationTime!: Date;

  @DeleteDateColumn({
    name: 'deletion_time',
  })
  deletionTime!: Date | null;
}
