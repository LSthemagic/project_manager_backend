import * as controller from './categories.controller.js';

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
  app.get('/', controller.listCategories);
  app.get('/:id', controller.getCategory);

  app.post('/', { preHandler: [ensureAdminOrManager] }, controller.createCategory);
  app.put('/:id', { preHandler: [ensureAdminOrManager] }, controller.updateCategory);
  app.delete('/:id', { preHandler: [ensureAdminOrManager] }, controller.deleteCategory);
}