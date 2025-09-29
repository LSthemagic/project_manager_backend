import { pool } from '../../config/database.js';

export async function findMembersByTeamId(teamId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.nome, u.email, ut.papel, u.profile_picture
     FROM usuario_team ut
     JOIN usuario u ON u.id = ut.usuario_id
     WHERE ut.team_id = $1`,
    [teamId]
  );
  return rows;
}

export async function addUserToTeam({ teamId, userId, papel }) {
  const { rows } = await pool.query(
    'INSERT INTO usuario_team (team_id, usuario_id, papel) VALUES ($1, $2, $3) RETURNING *',
    [teamId, userId, papel]
  );
  return rows[0];
}

export async function removeUserFromTeam({ teamId, userId }) {
  const { rowCount } = await pool.query(
    'DELETE FROM usuario_team WHERE team_id = $1 AND usuario_id = $2',
    [teamId, userId]
  );
  return rowCount > 0;
}

export async function findTeamsByProjectId(projectId) {
  const { rows } = await pool.query(
    `SELECT t.id as team_id, ut.usuario_id as user_id FROM team t 
     JOIN usuario_team ut ON t.id = ut.team_id
     WHERE t.projeto_id = $1`,
    [projectId]
  );
  return rows;
}