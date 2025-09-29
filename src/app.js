import fastify from 'fastify';
import { pool } from './config/database.js';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCors from '@fastify/cors';
import { authRoutes } from './modules/auth/auth.routes.js';
import { categoryRoutes } from './modules/categories/categories.routes.js';
import { userRoutes } from './modules/users/users.routes.js';
import { teamRoutes } from './modules/teams/teams.routes.js';
import { projectRoutes } from './modules/projects/projects.routes.js';
import fastifyMultipart from '@fastify/multipart';
import { taskRoutes } from './modules/tasks/tasks.routes.js';
import { contactRoutes } from './modules/contact/contact.routes.js';
import { reportRoutes } from './modules/reports/reports.routes.js';
import { searchRoutes } from './modules/search/search.routes.js';
import { auditRoutes } from './modules/admin/audit/audit.routes.js';
import { taskStatusRoutes } from './modules/admin/task-statuses/task-statuses.routes.js';
import { tagRoutes } from './modules/admin/tags/tags.routes.js';
import { commentRoutes } from './modules/comments/comments.routes.js';
import { subtaskRoutes } from './modules/subtasks/subtasks.routes.js';
import { timelogRoutes } from './modules/timelogs/timelogs.routes.js';
import { PostgreSQLSessionStore } from './lib/sessionStore.js';

async function buildApp() {
  const app = fastify({
    logger: true,
  });

  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'https://project-manager-backend-5wv2.onrender.com',
        'https://projeto-ifba.vercel.app',
        /^https:\/\/.*\.vercel\.app$/
      ];

      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') return allowedOrigin === origin;
        if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie']
  });

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'default-cookie-secret-key',
    parseOptions: {}
  });

  const sessionStore = new PostgreSQLSessionStore();
  const isProduction = process.env.NODE_ENV === 'production';

  // Configuração de cookie que se adapta ao ambiente (Produção vs. Desenvolvimento)
  app.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'default-session-secret-key-change-in-production',
    cookie: {
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
    },
    saveUninitialized: false,
    rolling: true,
    store: sessionStore
  });

  app.decorate('db', pool);

  app.addHook('onRequest', async (request, reply) => {
    app.log.info(`${request.method} ${request.url} - User-Agent: ${request.headers['user-agent']}`);
  });

  app.register(fastifyMultipart);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/db-test', async (request, reply) => {
    const result = await app.db.query('SELECT NOW()');
    reply.send({ success: true, timestamp: result.rows[0].now });
  });

  
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(categoryRoutes, { prefix: '/api/categories' });
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(teamRoutes, { prefix: '/api/teams' });
  app.register(projectRoutes, { prefix: '/api/projects' });
  app.register(taskRoutes, { prefix: '/api' });
  app.register(contactRoutes, { prefix: '/api/contact' });
  app.register(reportRoutes, { prefix: '/api/reports' });
  app.register(searchRoutes, { prefix: '/api/search' });
  app.register(auditRoutes, { prefix: '/api/admin/audit' });
  app.register(taskStatusRoutes, { prefix: '/api/admin/task-statuses' });
  app.register(tagRoutes, { prefix: '/api/admin/tags' });
  app.register(commentRoutes, { prefix: '/api' });
  app.register(subtaskRoutes, { prefix: '/api' });
  app.register(timelogRoutes, { prefix: '/api' });

  return app;
}

export { buildApp };