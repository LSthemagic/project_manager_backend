import * as controller from './projects.controller.js';

// Middleware: Garante que o usuário está logado
async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
}

// Middleware: Garante que é admin ou gerente
async function ensureAdminOrManager(request, reply) {
  // Este hook roda depois do ensureAuthenticated, então request.session.user sempre existirá
  const { tipo_usuario } = request.session.user;
  if (tipo_usuario !== 'admin' && tipo_usuario !== 'gerente') {
    reply.status(403).send({ message: 'Permissão insuficiente.' });
  }
}

export async function projectRoutes(app) {
  app.addHook('preHandler', ensureAuthenticated);

  app.get('/', controller.listProjects);
  app.post('/', { preHandler: [ensureAdminOrManager] }, controller.createProject);
  app.get('/:id', controller.getProject);
  app.put('/:id', { preHandler: [ensureAdminOrManager] }, controller.updateProject);
  app.delete('/:id', { preHandler: [ensureAdminOrManager] }, controller.deleteProject);

  // NOVA ROTA: Rota de ação para finalizar o projeto
  app.post('/:id/finish', { preHandler: [ensureAdminOrManager] }, controller.finishProject);
}