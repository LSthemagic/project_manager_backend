import { pool } from '../../config/database.js';

export async function findByProjectId(projectId) {
  const { rows } = await pool.query(
    `
    SELECT 
      t.*,
      json_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL) AS comentarios,
      json_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL) AS etiquetas,
      json_agg(DISTINCT a.*) FILTER (WHERE a.id IS NOT NULL) AS anexos,
      json_build_object(
        'id', u.id,
        'nome', u.nome,
        'email', u.email
      ) AS responsavel
    FROM tarefa t
    LEFT JOIN comentario c ON c.tarefa_id = t.id
    LEFT JOIN tarefa_etiqueta te ON te.tarefa_id = t.id
    LEFT JOIN etiqueta e ON e.id = te.etiqueta_id
    LEFT JOIN anexo a ON a.tarefa_id = t.id
    LEFT JOIN usuario u ON u.id = t.responsavel_id
    WHERE t.projeto_id = $1
    GROUP BY t.id, u.id
    ORDER BY t.data_criacao DESC
    `,
    [projectId]
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM tarefa WHERE id = $1', [id]);
  return rows[0];
}

export async function findAttachmentsByTaskId(taskId) {
  const { rows } = await pool.query('SELECT * FROM anexo WHERE tarefa_id = $1 ORDER BY data_upload DESC', [taskId]);
  return rows;
}

export async function getDefaultStatusId() {
  const { rows } = await pool.query(`SELECT id FROM status_tarefa WHERE nome = 'A Fazer' LIMIT 1`);
  if (rows.length === 0) {
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

export async function findTagsByTaskId(taskId) {
  const { rows } = await pool.query(
    `SELECT e.* FROM etiqueta e
     JOIN tarefa_etiqueta te ON e.id = te.etiqueta_id
     WHERE te.tarefa_id = $1 ORDER BY e.nome`,
    [taskId]
  );
  return rows;
}

export async function addTagToTask(taskId, tagId) {
  const { rows } = await pool.query(
    'INSERT INTO tarefa_etiqueta (tarefa_id, etiqueta_id) VALUES ($1, $2) RETURNING *',
    [taskId, tagId]
  );
  return rows[0];
}

export async function removeTagFromTask(taskId, tagId) {
  const { rowCount } = await pool.query(
    'DELETE FROM tarefa_etiqueta WHERE tarefa_id = $1 AND etiqueta_id = $2',
    [taskId, tagId]
  );
  return rowCount > 0;
}