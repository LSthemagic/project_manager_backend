import { pool } from '../../config/database.js';

export async function findByProjectId(projectId) {
  const { rows } = await pool.query('SELECT * FROM tarefa WHERE projeto_id = $1 ORDER BY data_criacao DESC', [projectId]);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM tarefa WHERE id = $1', [id]);
  return rows[0];
}

export async function getDefaultStatusId() {
  const { rows } = await pool.query(`SELECT id FROM status_tarefa WHERE nome = 'A Fazer' LIMIT 1`);
  if (rows.length === 0) {
    // Se não encontrar "A Fazer", pegar o primeiro status disponível
    const fallback = await pool.query(`SELECT id FROM status_tarefa ORDER BY id LIMIT 1`);
    return fallback.rows[0]?.id || 1;
  }
  return rows[0].id;
}

export async function create({ titulo, descricao, projeto_id, responsavel_id, status_id, prioridade, estimativa_horas, data_inicio, data_fim }) {
  const { rows } = await pool.query(
    `INSERT INTO tarefa (
      titulo, descricao, projeto_id, responsavel_id, status_id,
      prioridade, estimativa_horas, data_inicio, data_fim, conteudo_busca
    )
     VALUES (
      $1::text, $2::text, $3, $4, $5,
      $6::text, $7, $8, $9,
      to_tsvector('portuguese', $1::text || ' ' || COALESCE($2::text, ''))
    )
     RETURNING *`,
    [titulo, descricao, projeto_id, responsavel_id, status_id, prioridade, estimativa_horas, data_inicio, data_fim]
  );
  return rows[0];
}


export async function update(id, { titulo, descricao, responsavel_id, status_id, prioridade, estimativa_horas, data_inicio, data_fim }) {
  const { rows } = await pool.query(
    `UPDATE tarefa
     SET titulo = COALESCE($1::text, titulo),
         descricao = COALESCE($2::text, descricao),
         responsavel_id = COALESCE($3, responsavel_id),
         status_id = COALESCE($4, status_id),
         prioridade = COALESCE($5::text, prioridade),
         estimativa_horas = COALESCE($6, estimativa_horas),
         data_inicio = COALESCE($7, data_inicio),
         data_fim = COALESCE($8, data_fim),
         conteudo_busca = to_tsvector('portuguese', COALESCE($1::text, titulo) || ' ' || COALESCE(COALESCE($2::text, descricao), '')),
         data_atualizacao = NOW()
     WHERE id = $9 RETURNING *`,
    [titulo, descricao, responsavel_id, status_id, prioridade, estimativa_horas, data_inicio, data_fim, id]
  );
  return rows[0];
}


export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tarefa WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function getAllStatuses() {
  const { rows } = await pool.query('SELECT id, nome, descricao, cor FROM status_tarefa ORDER BY id');
  return rows;
}