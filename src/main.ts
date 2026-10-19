import { FsArchAppBuilder } from '@fsarch/server';
import { descriptor } from './lib/index.js';

async function bootstrap() {
  const app = await new FsArchAppBuilder(descriptor.module.register(), {
    name: 'Function-Gateway',
    version: '0.0.1',
  })
    .addSwagger(descriptor.swagger)
    .enableAuth()
    .setDatabase({ entities: descriptor.entities, migrations: descriptor.migrations })
    .build();

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
