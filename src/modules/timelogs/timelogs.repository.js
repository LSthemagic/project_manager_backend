import { pool } from '../../config/database.js';

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM timelog WHERE id = $1', [id]);
  return rows[0];
}

export async function findByTaskId(taskId) {
  const { rows } = await pool.query(
    `SELECT tl.*, u.nome as usuario_nome
     FROM timelog tl
     JOIN usuario u ON u.id = tl.usuario_id
     WHERE tl.tarefa_id = $1
     ORDER BY tl.data_registro DESC, tl.data_criacao DESC`,
    [taskId]
  );
  return rows;
}

export async function create({ horas, descricao, data_registro, tarefa_id, usuario_id }) {
  const { rows } = await pool.query(
    'INSERT INTO timelog (horas, descricao, data_registro, tarefa_id, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [horas, descricao, data_registro, tarefa_id, usuario_id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM timelog WHERE id = $1', [id]);
  return rowCount > 0;
}