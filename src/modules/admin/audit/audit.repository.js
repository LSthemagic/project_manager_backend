import { pool } from '../../../config/database.js';

export async function findAuditLogs({ filterByTable }) {
  let query = 'SELECT * FROM auditoria';
  const params = [];

  if (filterByTable) {
    query += ' WHERE tabela = $1';
    params.push(filterByTable);
  }

  query += ' ORDER BY data_operacao DESC LIMIT 100';

  const { rows } = await pool.query(query, params);
  return rows;
}