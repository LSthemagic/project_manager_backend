import * as repository from './comments.repository.js';

export async function listCommentsForTask(request, reply) {
  const { taskId } = request.params;
  const comments = await repository.findByTaskId(taskId);
  reply.send(comments);
}

export async function createComment(request, reply) {
  const { taskId } = request.params;
  const { conteudo } = request.body;
  const usuario_id = request.session.user.id;

  const newComment = await repository.create({ conteudo, tarefa_id: taskId, usuario_id });
  reply.status(201).send(newComment);
}

export async function deleteComment(request, reply) {
  const { commentId } = request.params;
  const user = request.session.user;

  const comment = await repository.findById(commentId);
  if (!comment) {
    return reply.status(404).send({ message: 'Comentário não encontrado.' });
  }

  const isAdminOrManager = user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente';
  const isAuthor = comment.usuario_id === user.id;

  if (!isAdminOrManager && !isAuthor) {
    return reply.status(403).send({ message: 'Você não tem permissão para deletar este comentário.' });
  }

  await repository.remove(commentId);
  reply.status(204).send();
}