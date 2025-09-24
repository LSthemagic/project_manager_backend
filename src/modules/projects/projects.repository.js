import { pool } from '../../config/database.js';

export async function findAll(user) {
  if (user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente') {
    const { rows } = await pool.query('SELECT * FROM projeto ORDER BY nome');
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT p.* FROM projeto p
     LEFT JOIN team t ON t.projeto_id = p.id
     LEFT JOIN usuario_team ut ON ut.team_id = t.id
     WHERE p.usuario_id = $1 OR ut.usuario_id = $1
     GROUP BY p.id ORDER BY p.nome`,
    [user.id]
  );
  return rows;
}

export async function findById(id, user) {
  const { rows } = await pool.query('SELECT * FROM projeto WHERE id = $1', [id]);
  const project = rows[0];

  if (!project) return null;

  if (user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente') {
    // ADIÇÃO: Busca o progresso usando a função do banco
    const { rows: progressResult } = await pool.query(
      'SELECT calcular_progresso_projeto($1) as progresso',
      [id]
    );
    project.progresso = progressResult[0].progresso;
    return project;
  }

  if (project.usuario_id === user.id) {
    const { rows: progressResult } = await pool.query(
      'SELECT calcular_progresso_projeto($1) as progresso',
      [id]
    );
    project.progresso = progressResult[0].progresso;
    return project;
  }

  const { rows: permissionRows } = await pool.query(
    `SELECT 1 FROM team t JOIN usuario_team ut ON t.id = ut.team_id WHERE t.projeto_id = $1 AND ut.usuario_id = $2`,
    [id, user.id]
  );
  
  if (permissionRows.length > 0) {
    const { rows: progressResult } = await pool.query(
      'SELECT calcular_progresso_projeto($1) as progresso',
      [id]
    );
    project.progresso = progressResult[0].progresso;
    return project;
  }
  
  return null;
}

export async function create({ nome, descricao, categoria_id, usuario_id }) {
  const { rows } = await pool.query(
    'INSERT INTO projeto (nome, descricao, categoria_id, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [nome, descricao, categoria_id, usuario_id]
  );
  return rows[0];
}

export async function update(id, { nome, descricao, categoria_id, status, configuracoes }) {
    const { rows } = await pool.query(
        'UPDATE projeto SET nome = $1, descricao = $2, categoria_id = $3, status = $4, configuracoes = $5, data_atualizacao = NOW() WHERE id = $6 RETURNING *',
        [nome, descricao, categoria_id, status, configuracoes, id]
    );
    return rows[0];
}

export async function remove(id) {
    const { rowCount } = await pool.query('DELETE FROM projeto WHERE id = $1', [id]);
    return rowCount > 0;
}

export async function finish(id, userId) {
  const { rows } = await pool.query('SELECT finalizar_projeto($1, $2)', [id, userId]);
  return rows[0].finalizar_projeto;
}