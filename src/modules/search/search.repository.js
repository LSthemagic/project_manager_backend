import { pool } from '../../config/database.js';

export async function searchTasks(searchTerm, user) {
  const { rows: allResults } = await pool.query(
    "SELECT * FROM buscar_tarefas($1)",
    [searchTerm]
  );

  if (user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente') {
    return allResults;
  }

  const { rows: accessibleProjects } = await pool.query(
    `SELECT p.id FROM projeto p
     LEFT JOIN team t ON t.projeto_id = p.id
     LEFT JOIN usuario_team ut ON ut.team_id = t.id
     WHERE p.usuario_id = $1 OR ut.usuario_id = $1
     GROUP BY p.id`,
    [user.id]
  );
  
  const accessibleProjectIds = new Set(accessibleProjects.map(p => p.id));

  const filteredResults = allResults.filter(task => {
    return pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [task.tarefa_id])
      .then(({ rows }) => rows.length > 0 && accessibleProjectIds.has(rows[0].projeto_id));
  });

  const finalResults = await Promise.all(filteredResults.map(async (task) => {
    const { rows } = await pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [task.tarefa_id]);
    if (rows.length > 0 && accessibleProjectIds.has(rows[0].projeto_id)) {
      return task;
    }
    return null;
  }));

  return finalResults.filter(task => task !== null);
}