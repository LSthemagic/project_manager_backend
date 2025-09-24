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
  const { titulo, descricao, responsavel_id, status_id } = request.body;

  const newTask = await repository.create({
    titulo,
    descricao,
    projeto_id: projectId,
    responsavel_id,
    status_id,
  });

  reply.status(201).send(newTask);
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