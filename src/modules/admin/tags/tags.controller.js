import * as repository from './tags.repository.js';

export async function listTags(request, reply) {
  const tags = await repository.findAll();
  return reply.send(tags);
}

export async function createTag(request, reply) {
  const newTag = await repository.create(request.body);
  return reply.status(201).send(newTag);
}

export async function deleteTag(request, reply) {
  const { id } = request.params;
  const success = await repository.remove(id);
  if (!success) {
    return reply.status(404).send({ message: 'Etiqueta não encontrada.' });
  }
  return reply.status(204).send();
}
