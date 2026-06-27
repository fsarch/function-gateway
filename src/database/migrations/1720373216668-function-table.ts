import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class FunctionTable1720373216668 implements MigrationInterface {
  name = 'FunctionTable1720373216668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. function_type Tabelle erstellen
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

    // 2. Initialen Datensatz in function_type einfuegen
    await queryRunner.manager.insert('function_type', {
      id: '4da0a7eb-6b9a-48f7-ab92-b53c042258f0',
      name: 'HTTP',
      external_id: '$system.http',
    });

    // 3. function Tabelle erstellen (mit function_type_id und Fremdschlüssel)
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
    // function Tabelle entfernen (automatisch mit allen Constraints)
    await queryRunner.dropTable('function');

    // function_type Tabelle entfernen
    await queryRunner.dropTable('function_type');
  }
}
