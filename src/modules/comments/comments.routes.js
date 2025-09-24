import * as controller from './comments.controller.js';
import * as projectRepository from '../projects/projects.repository.js';
import { pool } from '../../config/database.js';
import { checkProjectAccess } from '../../middleware/auth.middleware.js';


export async function commentRoutes(app) {
  // Rotas para listar e criar comentários DENTRO de uma tarefa
  // Ex: GET /api/tasks/:taskId/comments
  app.get('/tasks/:taskId/comments', { preHandler: [checkProjectAccess] }, controller.listCommentsForTask);
  app.post('/tasks/:taskId/comments', { preHandler: [checkProjectAccess] }, controller.createComment);

  // Rota para deletar um comentário específico
  // Ex: DELETE /api/comments/:commentId
  app.delete('/comments/:commentId', controller.deleteComment);
}