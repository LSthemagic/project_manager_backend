import * as repository from './audit.repository.js';

export async function listAuditLogs(request, reply) {
  const { table } = request.query; // Pega o filtro da URL, ex: ?table=tarefa

  const logs = await repository.findAuditLogs({ filterByTable: table });
  reply.send(logs);
}