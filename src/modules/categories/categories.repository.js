import { pool } from '../../config/database.js';

export async function findAll() {
  const { rows } = await pool.query('SELECT * FROM categoria_projeto ORDER BY nome');
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categoria_projeto WHERE id = $1', [id]);
  return rows[0];
}

export async function create({ nome, descricao, cor }) {
  const { rows } = await pool.query(
    'INSERT INTO categoria_projeto (nome, descricao, cor) VALUES ($1, $2, $3) RETURNING *',
    [nome, descricao, cor]
  );
  return rows[0];
}

export async function update(id, { nome, descricao, cor }) {
  const { rows } = await pool.query(
    'UPDATE categoria_projeto SET nome = $1, descricao = $2, cor = $3 WHERE id = $4 RETURNING *',
    [nome, descricao, cor, id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM categoria_projeto WHERE id = $1', [id]);
  return rowCount > 0;
}