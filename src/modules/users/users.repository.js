import { pool } from '../../config/database.js';

// Lista todos os usuários, sem a senha
export async function findAll() {
  const { rows } = await pool.query(
    'SELECT id, nome, email, tipo_usuario, ativo FROM usuario ORDER BY nome'
  );
  return rows;
}

// Busca um usuário por ID, sem a senha
export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, nome, email, tipo_usuario, ativo FROM usuario WHERE id = $1',
    [id]
  );
  return rows[0];
}

// Cria um novo usuário (ação de um admin)
export async function create({ nome, email, hashedPassword, tipo_usuario }) {
  const { rows } = await pool.query(
    'INSERT INTO usuario (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, ativo',
    [nome, email, hashedPassword, tipo_usuario]
  );
  return rows[0];
}

// Atualiza um usuário
export async function update(id, { nome, email, tipo_usuario, ativo }) {
  const { rows } = await pool.query(
    'UPDATE usuario SET nome = $1, email = $2, tipo_usuario = $3, ativo = $4, data_atualizacao = NOW() WHERE id = $5 RETURNING id, nome, email, tipo_usuario, ativo',
    [nome, email, tipo_usuario, ativo, id]
  );
  return rows[0];
}

// Deleta um usuário
export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM usuario WHERE id = $1', [id]);
  return rowCount > 0;
}