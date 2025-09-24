import * as controller from './search.controller.js';

async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
}

export async function searchRoutes(app) {
  app.get('/', { preHandler: [ensureAuthenticated] }, controller.performSearch);
}