import * as controller from './subtasks.controller.js';

import { checkProjectAccess } from '../../middleware/auth.middleware.js';

export async function subtaskRoutes(app) {
  app.get('/tasks/:taskId/subtasks', { preHandler: [checkProjectAccess] }, controller.listSubtasks);
  app.post('/tasks/:taskId/subtasks', { preHandler: [checkProjectAccess] }, controller.createSubtask);

  app.put('/subtasks/:subtaskId', { preHandler: [checkProjectAccess] }, controller.updateSubtask);
  app.delete('/subtasks/:subtaskId', { preHandler: [checkProjectAccess] }, controller.deleteSubtask);
}