import * as repository from './timelogs.repository.js';

export async function listTimeLogsForTask(request, reply) {
  const { taskId } = request.params;
  const timelogs = await repository.findByTaskId(taskId);
  reply.send(timelogs);
}

export async function createTimeLog(request, reply) {
  const { taskId } = request.params;
  const { horas, descricao, data_registro } = request.body;
  const usuario_id = request.session.user.id;

  const newTimeLog = await repository.create({
    horas,
    descricao,
    data_registro: data_registro || new Date(), // Usa a data enviada ou a data atual
    tarefa_id: taskId,
    usuario_id
  });
  reply.status(201).send(newTimeLog);
}

export async function deleteTimeLog(request, reply) {
  const { timelogId } = request.params;
  const user = request.session.user;

  const timelog = await repository.findById(timelogId);
  if (!timelog) {
    return reply.status(404).send({ message: 'Registro de tempo não encontrado.' });
  }

  const isAdminOrManager = user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente';
  const isAuthor = timelog.usuario_id === user.id;

  if (!isAdminOrManager && !isAuthor) {
    return reply.status(403).send({ message: 'Você não tem permissão para deletar este registro.' });
  }

  await repository.remove(timelogId);
  reply.status(204).send();
}