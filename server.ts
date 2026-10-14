import 'dotenv/config';
import { buildApp } from './app.js';

const app = await buildApp();
const port = Number(process.env.PORT || 3333);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}

const shutdown = async () => {
  await app.close();
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
