import 'dotenv/config';
import { buildApp } from './app.js';
import { testDatabaseConnection } from './config/database.js';

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

async function start() {
  await testDatabaseConnection();
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
