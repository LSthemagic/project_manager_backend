import { pool } from '../../config/database.js';

// Busca um comentário específico pelo seu ID
export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM comentario WHERE id = $1', [id]);
  return rows[0];
}

// Busca todos os comentários de uma tarefa, junto com o nome do autor
export async function findByTaskId(taskId) {
  const { rows } = await pool.query(
    `SELECT c.*, u.nome as usuario_nome
     FROM comentario c
     JOIN usuario u ON u.id = c.usuario_id
     WHERE c.tarefa_id = $1
     ORDER BY c.data_criacao ASC`,
    [taskId]
  );
  return rows;
}

// Cria um novo comentário
export async function create({ conteudo, tarefa_id, usuario_id }) {
  const { rows } = await pool.query(
    'INSERT INTO comentario (conteudo, tarefa_id, usuario_id) VALUES ($1, $2, $3) RETURNING *',
    [conteudo, tarefa_id, usuario_id]
  );
  return rows[0];
}

// Deleta um comentário
export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM comentario WHERE id = $1', [id]);
  return rowCount > 0;
}