import * as repository from './reports.repository.js';

export async function showDashboard(request, reply) {
  const data = await repository.getDashboardData();
  return reply.send(data);
}

export async function showProjectsReport(request, reply) {
  const data = await repository.getProjectsReport();
  return reply.send(data);
}

export async function showProductivityReport(request, reply) {
  const data = await repository.getProductivityReport();
  return reply.send(data);
}

export async function showPublicStats(request, reply) {
  const data = await repository.getPublicStats();
  return reply.send(data);
}
