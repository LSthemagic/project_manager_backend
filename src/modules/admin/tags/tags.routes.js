import * as controller from './tags.controller.js';

async function ensureAdmin(request, reply) {
  if (request.session.user?.tipo_usuario !== 'admin') {
    return reply.status(403).send({ message: 'Permissão insuficiente.' });
  }
}

export async function tagRoutes(app) {
  app.addHook('preHandler', ensureAdmin);

  app.get('/', controller.listTags);
  app.post('/', controller.createTag);
  app.delete('/:id', controller.deleteTag);
}