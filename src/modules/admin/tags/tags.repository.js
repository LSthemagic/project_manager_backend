import { pool } from '../../../config/database.js';

export async function findAll() {
  const { rows } = await pool.query('SELECT * FROM etiqueta ORDER BY nome');
  return rows;
}

export async function create({ nome, cor }) {
  const { rows } = await pool.query(
    'INSERT INTO etiqueta (nome, cor) VALUES ($1, $2) RETURNING *',
    [nome, cor]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM etiqueta WHERE id = $1', [id]);
  return rowCount > 0;
}