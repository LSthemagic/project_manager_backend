import * as repository from './tasks.repository.js';

export async function listTasksForProject(request, reply) {
  const { projectId } = request.params;
  const tasks = await repository.findByProjectId(projectId);
  reply.send(tasks);
}

export async function getTask(request, reply) {
  const { taskId } = request.params;
  const task = await repository.findById(taskId);
  if (!task) {
    return reply.status(404).send({ message: 'Tarefa não encontrada.' });
  }
  reply.send(task);
}

export async function createTaskInProject(request, reply) {
  const { projectId } = request.params;
  const { titulo, descricao, responsavel_id, status_id, prioridade, estimativa_horas, data_inicio, data_fim } = request.body;

  // Validação de campos obrigatórios
  if (!titulo || titulo.trim().length === 0) {
    return reply.status(400).send({ message: 'O título da tarefa é obrigatório.' });
  }

  // Se status_id não foi fornecido, buscar o status "A Fazer" como padrão
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

  return reply.status(201).send(newTask); // Adicionado return para garantir que o fluxo seja encerrado
}

export async function updateTask(request, reply) {
  const { taskId } = request.params;
  const updatedTask = await repository.update(taskId, request.body);
  if (!updatedTask) {
    return reply.status(404).send({ message: 'Tarefa não encontrada.' });
  }
  reply.send(updatedTask);
}

export async function deleteTask(request, reply) {
  const { taskId } = request.params;
  const success = await repository.remove(taskId);
  if (!success) {
    return reply.status(404).send({ message: 'Tarefa não encontrada.' });
  }
  reply.status(204).send();
}

export async function getTaskStatuses(request, reply) {
  const statuses = await repository.getAllStatuses();
  reply.send(statuses);
}