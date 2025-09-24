import { pool } from '../config/database.js';
import * as projectRepository from '../modules/projects/projects.repository.js';

export async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
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