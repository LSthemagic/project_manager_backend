import { pool } from '../../config/database.js';

export async function findByTaskId(taskId) {
  const { rows } = await pool.query(
    'SELECT * FROM subtarefa WHERE tarefa_id = $1 ORDER BY data_criacao ASC',
    [taskId]
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM subtarefa WHERE id = $1', [id]);
  return rows[0];
}

export async function create({ titulo, tarefa_id }) {
  const { rows } = await pool.query(
    'INSERT INTO subtarefa (titulo, tarefa_id) VALUES ($1, $2) RETURNING *',
    [titulo, tarefa_id]
  );
  return rows[0];
}

export async function update(id, { titulo, concluida }) {
  const { rows } = await pool.query(
    'UPDATE subtarefa SET titulo = $1, concluida = $2 WHERE id = $3 RETURNING *',
    [titulo, concluida, id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM subtarefa WHERE id = $1', [id]);
  return rowCount > 0;
}