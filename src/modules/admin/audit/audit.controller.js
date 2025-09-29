import * as repository from './audit.repository.js';

export async function listAuditLogs(request, reply) {
  const { table } = request.query;
  const logs = await repository.findAuditLogs({ filterByTable: table });
  return reply.send(logs);
}
