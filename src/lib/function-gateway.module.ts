import { createServiceModule } from '@fsarch/server';
import { FunctionEntity } from '../database/entities/function.entity.js';
import { FunctionTypeEntity } from '../database/entities/function.type.entity.js';
import { FunctionController } from '../controllers/function/function.controller.js';
import { FunctionExecuteController } from '../controllers/function/function.execute.controller.js';
import { FunctionService } from '../controllers/function/function.service.js';
import { FunctionWorkerAuthService } from '../services/function-worker/function-worker.auth.service.js';

/**
 * `FunctionWorkerAuthService`'s `function_worker:` config section is read
 * via a plain injected `@nestjs/config` `ConfigService`, not `@fsarch/server`'s
 * `serviceId`-aware `ModuleConfiguration`. Left as-is here (standalone
 * behavior unaffected) - same class of gap flagged for `metric-server`'s
 * `PartitionService`, not addressed until a real mount of this service is
 * attempted.
 */
export const FunctionGatewayModule = createServiceModule({
  entities: [FunctionEntity, FunctionTypeEntity],
  controllers: [FunctionController, FunctionExecuteController],
  providers: [FunctionService, FunctionWorkerAuthService],
});
