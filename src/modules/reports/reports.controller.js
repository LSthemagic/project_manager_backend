import * as repository from './reports.repository.js';

export async function showDashboard(request, reply) {
  const data = await repository.getDashboardData();
  reply.send(data);
}

export async function showProjectsReport(request, reply) {
  const data = await repository.getProjectsReport();
  reply.send(data);
}

export async function showProductivityReport(request, reply) {
  const data = await repository.getProductivityReport();
  reply.send(data);
}