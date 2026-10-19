import { DATABASE_OPTIONS } from '../database/index.js';
import { FunctionGatewayModule } from './function-gateway.module.js';

export { FunctionGatewayModule };
export const entities = DATABASE_OPTIONS.entities;
export const migrations = DATABASE_OPTIONS.migrations;

/**
 * The frozen equivalent of this service's standalone `main.ts` builder
 * calls, as data - see `@fsarch/server`'s `ServiceMountDescriptor`. A
 * mono-service harness spreads this into `.addService({ id, ...descriptor })`;
 * the standalone `main.ts` keeps calling the builder methods directly (no
 * behavior change), just sourcing its values from here instead of
 * duplicating them.
 */
export const descriptor = {
  module: FunctionGatewayModule,
  entities,
  migrations,
  swagger: {
    title: 'Function Gateway API',
    description:
      'API for managing and executing remote functions via worker servers',
    version: '1.0',
  },
  auth: true,
};
