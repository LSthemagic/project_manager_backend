import { pool } from '../../config/database.js';

export async function findByProjectId(projectId) {
  const { rows } = await pool.query('SELECT * FROM tarefa WHERE projeto_id = $1 ORDER BY data_criacao DESC', [projectId]);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM tarefa WHERE id = $1', [id]);
  return rows[0];
}

export async function create({ titulo, descricao, projeto_id, responsavel_id, status_id }) {
  const { rows } = await pool.query(
    `INSERT INTO tarefa (titulo, descricao, projeto_id, responsavel_id, status_id, conteudo_busca)
     VALUES ($1::text, $2::text, $3, $4, $5, to_tsvector('portuguese', $1::text || ' ' || COALESCE($2::text, '')))
     RETURNING *`,
    [titulo, descricao, projeto_id, responsavel_id, status_id]
  );
  return rows[0];
}


export async function update(id, { titulo, descricao, responsavel_id, status_id }) {
  const { rows } = await pool.query(
    `UPDATE tarefa 
     SET titulo = $1::text, 
         descricao = $2::text, 
         responsavel_id = $3, 
         status_id = $4, 
         conteudo_busca = to_tsvector('portuguese', $1::text || ' ' || COALESCE($2::text, '')),
         data_atualizacao = NOW() 
     WHERE id = $5 RETURNING *`,
    [titulo, descricao, responsavel_id, status_id, id]
  );
  return rows[0];
}


export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tarefa WHERE id = $1', [id]);
  return rowCount > 0;
}