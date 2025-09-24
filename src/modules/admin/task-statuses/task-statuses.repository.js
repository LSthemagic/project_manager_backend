import { pool } from '../../../config/database.js';

export async function findAll() {
  const { rows } = await pool.query('SELECT * FROM status_tarefa ORDER BY id');
  return rows;
}

export async function create({ nome, descricao, cor }) {
  const { rows } = await pool.query(
    'INSERT INTO status_tarefa (nome, descricao, cor) VALUES ($1, $2, $3) RETURNING *',
    [nome, descricao, cor]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM status_tarefa WHERE id = $1', [id]);
  return rowCount > 0;
}