import { pool } from '../../config/database.js';

export async function getDashboardData() {
  const { rows } = await pool.query('SELECT * FROM dashboard_executivo');
  return rows[0];
}

export async function getProjectsReport() {
  const { rows } = await pool.query('SELECT * FROM relatorio_projetos');
  return rows;
}

export async function getProductivityReport() {
  const { rows } = await pool.query('SELECT * FROM relatorio_produtividade');
  return rows;
}