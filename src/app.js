import fastify from 'fastify';
import { pool } from './config/database.js';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
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

async function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.register(fastifyCookie);
  app.register(fastifySession, {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    },
    saveUninitialized: false,
  });

  app.decorate('db', pool);

  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/db-test', async (request, reply) => {
    const result = await app.db.query('SELECT NOW()');
    reply.send({ success: true, timestamp: result.rows[0].now });
  });
  app.register(fastifyMultipart);
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

  
  return app;
}

export { buildApp };