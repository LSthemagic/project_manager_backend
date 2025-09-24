import * as controller from './users.controller.js';

// Middleware para garantir que apenas administradores acessem
async function ensureAdmin(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
  if (request.session.user.tipo_usuario !== 'admin') {
    return reply.status(403).send({ message: 'Permissão insuficiente. Acesso restrito a administradores.' });
  }
}

export async function userRoutes(app) {
  // Aplica o middleware de verificação de admin em TODAS as rotas deste módulo
  app.addHook('preHandler', ensureAdmin);

  app.get('/', controller.listUsers);
  app.post('/', controller.createUser);
  app.get('/:id', controller.getUser);
  app.put('/:id', controller.updateUser);
  app.delete('/:id', controller.deleteUser);
}