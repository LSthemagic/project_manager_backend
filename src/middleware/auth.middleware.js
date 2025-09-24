import { pool } from '../config/database.js';
import * as projectRepository from '../modules/projects/projects.repository.js';

// Middleware para garantir que o usuário está logado
export async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
}

// Middleware de segurança completo e unificado
export async function checkProjectAccess(request, reply) {
  const user = request.session.user;

  // Garante que o usuário está logado antes de prosseguir
  if (!user) {
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }

  let projectId = request.params.projectId;

  // Se o projectId não veio direto na URL, tenta encontrá-lo a partir de outros IDs
  if (!projectId) {
    let taskId = request.params.taskId;

    // Tenta encontrar o taskId a partir de um subtaskId
    if (request.params.subtaskId) {
      const subtaskResult = await pool.query('SELECT tarefa_id FROM subtarefa WHERE id = $1', [request.params.subtaskId]);
      if (subtaskResult.rows.length === 0) {
        return reply.status(404).send({ message: 'Sub-tarefa não encontrada.' });
      }
      taskId = subtaskResult.rows[0].tarefa_id;
    }

    // Tenta encontrar o taskId a partir de um commentId (se necessário no futuro)
    if (request.params.commentId) {
        const commentResult = await pool.query('SELECT tarefa_id FROM comentario WHERE id = $1', [request.params.commentId]);
        if (commentResult.rows.length === 0) return reply.status(404).send({ message: 'Comentário não encontrado.' });
        taskId = commentResult.rows[0].tarefa_id;
    }

    // Se encontramos um taskId (direto ou indireto), buscamos o projectId
    if (taskId) {
      const taskResult = await pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [taskId]);
      if (taskResult.rows.length === 0) {
        return reply.status(404).send({ message: 'Tarefa não encontrada.' });
      }
      projectId = taskResult.rows[0].projeto_id;
    }
  }

  // Se, depois de tudo, não encontramos um projectId, a rota está mal configurada
  if (!projectId) {
    return reply.status(400).send({ message: 'ID do projeto não pôde ser determinado a partir da rota.' });
  }
  
  // Usamos nosso repositório de projetos, que já tem a lógica de permissão
  const project = await projectRepository.findById(projectId, user);
  
  // Se o repositório retornar null, significa que o projeto não existe OU o usuário não tem permissão
  if (!project) {
    return reply.status(403).send({ message: 'Você não tem permissão para acessar este projeto.' });
  }

  // Se chegou até aqui, o acesso é permitido. Anexa o projeto à requisição para uso opcional.
  request.project = project;
}