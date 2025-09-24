import * as controller from './timelogs.controller.js';
import { checkProjectAccess } from '../../middleware/auth.middleware.js'; // Importa o middleware central

export async function timelogRoutes(app) {
  // Rotas para listar e criar time logs DENTRO de uma tarefa
  // Ex: GET /api/tasks/:taskId/timelogs
  app.get('/tasks/:taskId/timelogs', { preHandler: [checkProjectAccess] }, controller.listTimeLogsForTask);
  app.post('/tasks/:taskId/timelogs', { preHandler: [checkProjectAccess] }, controller.createTimeLog);

  // Rota para deletar um time log específico
  // Ex: DELETE /api/timelogs/:timelogId
  app.delete('/timelogs/:timelogId', controller.deleteTimeLog);
}