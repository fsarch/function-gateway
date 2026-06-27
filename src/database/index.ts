import { FunctionEntity } from './entities/function.entity.js';
import { FunctionTypeEntity } from './entities/function.type.entity.js';
import { FunctionTable1720373216668 } from './migrations/1720373216668-function-table.js';

export const DATABASE_OPTIONS = {
  entities: [FunctionEntity, FunctionTypeEntity],
  migrations: [FunctionTable1720373216668],
};

export { FunctionEntity };
export { FunctionTypeEntity };
export { FunctionTable1720373216668 };
