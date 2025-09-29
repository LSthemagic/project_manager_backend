import * as repository from './tasks.repository.js';

export async function listTasksForProject(request, reply) {
  const { projectId } = request.params;
  const tasks = await repository.findByProjectId(projectId);
  return reply.send(tasks);
}

export async function getTask(request, reply) {
  const { taskId } = request.params;
  const task = await repository.findById(taskId);
  if (!task) {
    return reply.status(404).send({ message: 'Tarefa não encontrada.' });
  }
  return reply.send(task);
}

export async function listAttachmentsForTask(request, reply) {
  const { taskId } = request.params;
  const attachments = await repository.findAttachmentsByTaskId(taskId);
  return reply.send(attachments);
}

export async function createTaskInProject(request, reply) {
  const { projectId } = request.params;
  const { titulo, descricao, responsavel_id, status_id, prioridade, estimativa_horas, data_inicio, data_fim } = request.body;

  if (!titulo || titulo.trim().length === 0) {
    return reply.status(400).send({ message: 'O título da tarefa é obrigatório.' });
  }

  let finalStatusId = status_id;
  if (!finalStatusId) {
    const defaultStatus = await repository.getDefaultStatusId();
    finalStatusId = defaultStatus;
  }

  const newTask = await repository.create({
    titulo: titulo.trim(),
    descricao,
    projeto_id: projectId,
    responsavel_id,
    status_id: finalStatusId,
    prioridade: prioridade || 'media',
    estimativa_horas: estimativa_horas || 0,
    data_inicio,
    data_fim,
  });

  return reply.status(201).send(newTask);
}

export async function updateTask(request, reply) {
  const { taskId } = request.params;
  const updatedTask = await repository.update(taskId, request.body);
  if (!updatedTask) {
    return reply.status(404).send({ message: 'Tarefa não encontrada.' });
  }
  return reply.send(updatedTask);
}

export async function deleteTask(request, reply) {
  const { taskId } = request.params;
  const success = await repository.remove(taskId);
  if (!success) {
    return reply.status(404).send({ message: 'Tarefa não encontrada.' });
  }
  return reply.status(204).send();
}

export async function getTaskStatuses(request, reply) {
  const statuses = await repository.getAllStatuses();
  return reply.send(statuses);
}

export async function listTaskTags(request, reply) {
  const { taskId } = request.params;
  const tags = await repository.findTagsByTaskId(taskId);
  return reply.send(tags);
}

export async function addTaskTag(request, reply) {
  const { taskId } = request.params;
  const { etiqueta_id } = request.body;
  const newTagLink = await repository.addTagToTask(taskId, etiqueta_id);
  return reply.status(201).send(newTagLink);
}

export async function removeTaskTag(request, reply) {
  const { taskId, tagId } = request.params;
  const success = await repository.removeTagFromTask(taskId, tagId);
  if (!success) {
    return reply.status(404).send({ message: 'Etiqueta não encontrada nesta tarefa.' });
  }
  return reply.status(204).send();
}