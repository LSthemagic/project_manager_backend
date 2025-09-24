import * as controller from './reports.controller.js';

async function ensureAdminOrManager(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
  const { tipo_usuario } = request.session.user;
  if (tipo_usuario !== 'admin' && tipo_usuario !== 'gerente') {
    return reply.status(403).send({ message: 'Permissão insuficiente para acessar relatórios.' });
  }
}

export async function reportRoutes(app) {
  // Rota pública para estatísticas do homepage
  app.get('/public-stats', controller.showPublicStats);

  app.addHook('preHandler', ensureAdminOrManager);

  app.get('/dashboard', controller.showDashboard);
  app.get('/projects', controller.showProjectsReport);
  app.get('/productivity', controller.showProductivityReport);
}