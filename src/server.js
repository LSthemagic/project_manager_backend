import 'dotenv/config';
import { buildApp } from './app.js';
import { testDatabaseConnection } from './config/database.js';

const PORT = Number(process.env.PORT) || 3333;

async function start() {
  await testDatabaseConnection();
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();