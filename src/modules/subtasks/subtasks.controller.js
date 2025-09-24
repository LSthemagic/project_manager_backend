import * as repository from './subtasks.repository.js';

export async function listSubtasks(request, reply) {
  const { taskId } = request.params;
  const subtasks = await repository.findByTaskId(taskId);
  reply.send(subtasks);
}

export async function createSubtask(request, reply) {
  const { taskId } = request.params;
  const { titulo } = request.body;
  const newSubtask = await repository.create({ titulo, tarefa_id: taskId });
  reply.status(201).send(newSubtask);
}

export async function updateSubtask(request, reply) {
  const { subtaskId } = request.params;
  const { titulo, concluida } = request.body;

  const subtask = await repository.findById(subtaskId);
  if (!subtask) {
    return reply.status(404).send({ message: 'Sub-tarefa não encontrada.' });
  }

  // Atualiza apenas os campos fornecidos, mantendo os existentes se não forem passados
  const updatedData = {
    titulo: titulo !== undefined ? titulo : subtask.titulo,
    concluida: concluida !== undefined ? concluida : subtask.concluida,
  };

  const updatedSubtask = await repository.update(subtaskId, updatedData);
  reply.send(updatedSubtask);
}

export async function deleteSubtask(request, reply) {
  const { subtaskId } = request.params;
  const success = await repository.remove(subtaskId);
  if (!success) {
    return reply.status(404).send({ message: 'Sub-tarefa não encontrada.' });
  }
  reply.status(204).send();
}