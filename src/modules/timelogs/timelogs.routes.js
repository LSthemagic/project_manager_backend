import * as controller from './timelogs.controller.js';
import { checkProjectAccess } from '../../middleware/auth.middleware.js';

export async function timelogRoutes(app) {
  app.get('/tasks/:taskId/timelogs', { preHandler: [checkProjectAccess] }, controller.listTimeLogsForTask);
  app.post('/tasks/:taskId/timelogs', { preHandler: [checkProjectAccess] }, controller.createTimeLog);

  app.delete('/timelogs/:timelogId', controller.deleteTimeLog);
}