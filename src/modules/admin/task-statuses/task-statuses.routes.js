import * as controller from './task-statuses.controller.js';

async function ensureAdmin(request, reply) {
  if (request.session.user?.tipo_usuario !== 'admin') {
    return reply.status(403).send({ message: 'Permissão insuficiente.' });
  }
}

export async function taskStatusRoutes(app) {
  app.addHook('preHandler', ensureAdmin);

  app.get('/', controller.listTaskStatuses);
  app.post('/', controller.createTaskStatus);
  app.delete('/:id', controller.deleteTaskStatus);
}