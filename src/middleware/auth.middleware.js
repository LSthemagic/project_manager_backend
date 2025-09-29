import { pool } from '../config/database.js';
import * as projectRepository from '../modules/projects/projects.repository.js';

export async function ensureAuthenticated(request, reply) {
  // Verificar se existe sessão
  if (!request.session) {
    console.warn('No session found in request');
    return reply.status(401).send({
      message: 'Sessão inválida. Por favor, faça login novamente.',
      code: 'SESSION_INVALID'
    });
  }

  // Verificar se existe usuário na sessão
  if (!request.session.user) {
    console.warn('No user found in session');
    return reply.status(401).send({
      message: 'Acesso negado. Por favor, faça login.',
      code: 'USER_NOT_AUTHENTICATED'
    });
  }

  // Opcional: Verificar se o usuário ainda existe no banco (para casos de usuário deletado)
  // Esta verificação pode ser comentada para melhor performance
  /*
  try {
    const { rows } = await pool.query('SELECT id FROM usuario WHERE id = $1', [request.session.user.id]);
    if (rows.length === 0) {
      console.warn(`User ${request.session.user.id} not found in database`);
      await request.session.destroy();
      return reply.status(401).send({
        message: 'Usuário não encontrado. Por favor, faça login novamente.',
        code: 'USER_NOT_FOUND'
      });
    }
  } catch (error) {
    console.error('Error validating user in database:', error);
    return reply.status(500).send({
      message: 'Erro interno do servidor.',
      code: 'INTERNAL_ERROR'
    });
  }
  */

  // Se chegou até aqui, está autenticado
  console.log(`Authenticated user: ${request.session.user.id} (${request.session.user.email})`);
}

export async function checkProjectAccess(request, reply) {
  const user = request.session.user;

  if (!user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }

  let projectId = request.params.projectId;

  if (!projectId) {
    let taskId = request.params.taskId;

    if (request.params.subtaskId) {
      const subtaskResult = await pool.query('SELECT tarefa_id FROM subtarefa WHERE id = $1', [request.params.subtaskId]);
      if (subtaskResult.rows.length === 0) {
        return reply.status(404).send({ message: 'Sub-tarefa não encontrada.' });
      }
      taskId = subtaskResult.rows[0].tarefa_id;
    }

    if (request.params.commentId) {
        const commentResult = await pool.query('SELECT tarefa_id FROM comentario WHERE id = $1', [request.params.commentId]);
        if (commentResult.rows.length === 0) return reply.status(404).send({ message: 'Comentário não encontrado.' });
        taskId = commentResult.rows[0].tarefa_id;
    }

    if (taskId) {
      const taskResult = await pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [taskId]);
      if (taskResult.rows.length === 0) {
        return reply.status(404).send({ message: 'Tarefa não encontrada.' });
      }
      projectId = taskResult.rows[0].projeto_id;
    }
  }

  if (!projectId) {
    return reply.status(400).send({ message: 'ID do projeto não pôde ser determinado a partir da rota.' });
  }
  
  const project = await projectRepository.findById(projectId, user);
  
  if (!project) {
    return reply.status(403).send({ message: 'Você não tem permissão para acessar este projeto.' });
  }

  request.project = project;
}