import * as controller from './audit.controller.js';

// Middleware para garantir que apenas administradores acessem
async function ensureAdmin(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
  if (request.session.user.tipo_usuario !== 'admin') {
    return reply.status(403).send({ message: 'Permissão insuficiente. Acesso restrito a administradores.' });
  }
}

export async function auditRoutes(app) {
  // Aplica o middleware de segurança a todas as rotas deste módulo
  app.addHook('preHandler', ensureAdmin);

  app.get('/log', controller.listAuditLogs);
}