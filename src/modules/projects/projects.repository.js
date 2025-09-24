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

export async function findById(id) {
    const { rows } = await pool.query('SELECT * FROM projeto WHERE id = $1', [id]);
    return rows[0];
}

export async function create({ nome, descricao, categoria_id, usuario_id }) {
  const { rows } = await pool.query(
    'INSERT INTO projeto (nome, descricao, categoria_id, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [nome, descricao, categoria_id, usuario_id]
  );
  return rows[0];
}

export async function update(id, { nome, descricao, categoria_id, status }) {
    const { rows } = await pool.query(
        'UPDATE projeto SET nome = $1, descricao = $2, categoria_id = $3, status = $4, data_atualizacao = NOW() WHERE id = $5 RETURNING *',
        [nome, descricao, categoria_id, status, id]
    );
    return rows[0];
}

export async function remove(id) {
    const { rowCount } = await pool.query('DELETE FROM projeto WHERE id = $1', [id]);
    return rowCount > 0;
}