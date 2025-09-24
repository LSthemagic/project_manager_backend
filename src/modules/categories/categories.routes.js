import * as controller from './categories.controller.js';

// Middleware para verificar se o usuário está logado e tem permissão
async function ensureAdminOrManager(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
  const { tipo_usuario } = request.session.user;
  if (tipo_usuario !== 'admin' && tipo_usuario !== 'gerente') {
    return reply.status(403).send({ message: 'Permissão insuficiente.' });
  }
}

export async function categoryRoutes(app) {
  // Rotas públicas (qualquer usuário logado pode ver)
  app.get('/', controller.listCategories);
  app.get('/:id', controller.getCategory);

  // Rotas protegidas (apenas admin ou gerente podem acessar)
  app.post('/', { preHandler: [ensureAdminOrManager] }, controller.createCategory);
  app.put('/:id', { preHandler: [ensureAdminOrManager] }, controller.updateCategory);
  app.delete('/:id', { preHandler: [ensureAdminOrManager] }, controller.deleteCategory);
}