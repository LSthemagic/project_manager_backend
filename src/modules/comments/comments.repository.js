import { pool } from '../../config/database.js';

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM comentario WHERE id = $1', [id]);
  return rows[0];
}

export async function findByTaskId(taskId) {
  const { rows } = await pool.query(
    `SELECT c.*, u.nome, u.email as usuario_email, u.profile_picture as usuario_profile_picture
     FROM comentario c
     JOIN usuario u ON u.id = c.usuario_id
     WHERE c.tarefa_id = $1
     ORDER BY c.data_criacao ASC`,
    [taskId]
  );
  return rows;
}

export async function create({ conteudo, tarefa_id, usuario_id }) {
  const { rows } = await pool.query(
    'INSERT INTO comentario (conteudo, tarefa_id, usuario_id) VALUES ($1, $2, $3) RETURNING *',
    [conteudo, tarefa_id, usuario_id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM comentario WHERE id = $1', [id]);
  return rowCount > 0;
}