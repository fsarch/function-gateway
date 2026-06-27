import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class FunctionTable1720373216668 implements MigrationInterface {
  name = 'FunctionTable1720373216668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create function_type table
    await queryRunner.createTable(
      new Table({
        name: 'function_type',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__function_type',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '256',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '256',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'creation_time',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletion_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
    );

    // 2. Insert initial data into function_type
    await queryRunner.manager.insert('function_type', {
      id: '4da0a7eb-6b9a-48f7-ab92-b53c042258f0',
      name: 'HTTP',
      external_id: '$system.http',
    });

    // 3. Create function table (with function_type_id and foreign key)
    await queryRunner.createTable(
      new Table({
        name: 'function',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__function',
            default: 'gen_random_uuid()',
          },
          {
            name: 'function_uuid',
            type: 'varchar',
            length: '256',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '256',
            isNullable: true,
          },
          {
            name: 'function_type_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'creation_time',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletion_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['function_type_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'function_type',
            onDelete: 'SET NULL',
            name: 'fk__function__function_type_id',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop function table (automatically with all constraints)
    await queryRunner.dropTable('function');

    // Drop function_type table
    await queryRunner.dropTable('function_type');
  }
}
