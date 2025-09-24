import { pool } from '../../config/database.js';

// Retorna os dados da view do dashboard executivo
export async function getDashboardData() {
  const { rows } = await pool.query('SELECT * FROM dashboard_executivo');
  return rows[0]; // Essa view retorna apenas uma linha
}

// Retorna os dados da view de relatório de projetos
export async function getProjectsReport() {
  const { rows } = await pool.query('SELECT * FROM relatorio_projetos');
  return rows;
}

// Retorna os dados da view de produtividade
export async function getProductivityReport() {
  const { rows } = await pool.query('SELECT * FROM relatorio_produtividade');
  return rows;
}