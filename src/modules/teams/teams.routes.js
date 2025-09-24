import * as controller from './teams.controller.js';

async function ensureAdminOrManager(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado.' });
  }
  const { tipo_usuario } = request.session.user;
  if (tipo_usuario !== 'admin' && tipo_usuario !== 'gerente') {
    return reply.status(403).send({ message: 'Permissão insuficiente.' });
  }
}

export async function teamRoutes(app) {
  // Ver lista de membros (qualquer um logado pode ver)
  app.get('/:teamId/members', controller.listTeamMembers);

  // Ações de gerenciamento (apenas admin/gerente)
  app.post('/:teamId/members', { preHandler: [ensureAdminOrManager] }, controller.addTeamMember);
  app.delete('/:teamId/members/:userId', { preHandler: [ensureAdminOrManager] }, controller.removeTeamMember);
}