import * as repository from './search.repository.js';

export async function performSearch(request, reply) {
  const { q } = request.query;
  const user = request.session.user;

  if (!q) {
    return reply.status(400).send({ message: "O parâmetro de busca 'q' é obrigatório." });
  }

  const results = await repository.searchTasks(q, user);
  return reply.send(results);
}
