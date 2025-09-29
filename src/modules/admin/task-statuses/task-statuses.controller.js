import * as repository from './task-statuses.repository.js';

export async function listTaskStatuses(request, reply) {
  const statuses = await repository.findAll();
  return reply.send(statuses);
}

export async function createTaskStatus(request, reply) {
  const newStatus = await repository.create(request.body);
  return reply.status(201).send(newStatus);
}

export async function deleteTaskStatus(request, reply) {
  const { id } = request.params;
  const success = await repository.remove(id);
  if (!success) {
    return reply.status(404).send({ message: 'Status de tarefa não encontrado.' });
  }
  return reply.status(204).send();
}
