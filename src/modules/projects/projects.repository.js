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
  // CORREÇÃO: A query agora faz um LEFT JOIN com a tabela team para incluir team_id e lider_id
  const { rows } = await pool.query(
    `SELECT p.*, t.id as team_id, t.lider_id
     FROM projeto p
     LEFT JOIN team t ON t.projeto_id = p.id
     WHERE p.id = $1`,
    [id]
  );
  const project = rows[0];

  if (!project) return null;

  // O resto da lógica de permissão e progresso permanece a mesma
  if (user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente') {
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

export async function create({ nome, descricao, categoria_id, usuario_id, status, prioridade, data_inicio, data_fim, orcamento }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Cria o projeto com todos os campos
    const projectResult = await client.query(
    `INSERT INTO projeto 
      (nome, descricao, categoria_id, usuario_id, status, prioridade, data_inicio, data_fim, orcamento) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     RETURNING *`,
    [nome, descricao, categoria_id, usuario_id, status, prioridade, data_inicio, data_fim, orcamento]
    );
    const newProject = projectResult.rows[0];

    // 2. Cria uma equipe para o projeto e define o criador como líder
    const teamResult = await client.query(
      'INSERT INTO team (nome, projeto_id, lider_id) VALUES ($1, $2, $3) RETURNING id',
      [`Equipe ${newProject.nome}`, newProject.id, usuario_id]
    );
    const newTeam = teamResult.rows[0];
    
    // 3. Adiciona o líder à tabela de membros (usuario_team)
    await client.query(
      'INSERT INTO usuario_team (usuario_id, team_id, papel) VALUES ($1, $2, $3)',
      [usuario_id, newTeam.id, 'lider']
    );

    await client.query('COMMIT');
    return newProject;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function update(id, { nome, descricao, categoria_id, status, prioridade, data_inicio, data_fim, orcamento }) {
    const { rows } = await pool.query(
        `UPDATE projeto 
         SET nome = COALESCE($1, nome), 
             descricao = COALESCE($2, descricao), 
             categoria_id = COALESCE($3, categoria_id), 
             status = COALESCE($4, status),
             prioridade = COALESCE($5, prioridade),
             data_inicio = COALESCE($6, data_inicio),
             data_fim = COALESCE($7, data_fim),
             orcamento = COALESCE($8, orcamento),
             data_atualizacao = NOW() 
         WHERE id = $9 RETURNING *`,
        [nome, descricao, categoria_id, status, prioridade, data_inicio, data_fim, orcamento, id]
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

