import { pool } from '../../config/database.js';

export async function findAll() {
  const { rows } = await pool.query(
    'SELECT id, nome, email, tipo_usuario, ativo FROM usuario ORDER BY nome'
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, nome, email, tipo_usuario, ativo FROM usuario WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function create({ nome, email, hashedPassword, tipo_usuario }) {
  const { rows } = await pool.query(
    'INSERT INTO usuario (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, ativo',
    [nome, email, hashedPassword, tipo_usuario]
  );
  return rows[0];
}

export async function update(id, { nome, email, tipo_usuario, ativo }) {
  const { rows } = await pool.query(
    'UPDATE usuario SET nome = $1, email = $2, tipo_usuario = $3, ativo = $4, data_atualizacao = NOW() WHERE id = $5 RETURNING id, nome, email, tipo_usuario, ativo',
    [nome, email, tipo_usuario, ativo, id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM usuario WHERE id = $1', [id]);
  return rowCount > 0;
}
export async function updatePreferences(userId, preferences) {
  const { rows } = await pool.query(
    'UPDATE usuario SET preferencias = $1, data_atualizacao = NOW() WHERE id = $2 RETURNING *',
    [preferences, userId]
  );
  return rows[0];
}