import * as controller from './comments.controller.js';
import * as projectRepository from '../projects/projects.repository.js';
import { pool } from '../../config/database.js';
import { checkProjectAccess } from '../../middleware/auth.middleware.js';


export async function commentRoutes(app) {
  app.get('/tasks/:taskId/comments', { preHandler: [checkProjectAccess] }, controller.listCommentsForTask);
  app.post('/tasks/:taskId/comments', { preHandler: [checkProjectAccess] }, controller.createComment);

  app.delete('/comments/:commentId', { preHandler: [checkProjectAccess] }, controller.deleteComment);
}