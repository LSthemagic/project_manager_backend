import { pool } from '../../config/database.js';

export async function searchTasks(searchTerm, user) {
  // 1. Chama a função do banco de dados para obter todos os resultados brutos da busca
  const { rows: allResults } = await pool.query(
    "SELECT * FROM buscar_tarefas($1)",
    [searchTerm]
  );

  // 2. Se o usuário for admin ou gerente, ele pode ver tudo.
  if (user.tipo_usuario === 'admin' || user.tipo_usuario === 'gerente') {
    return allResults;
  }

  // 3. Se for um usuário comum, precisamos filtrar os resultados.
  // Primeiro, obtemos a lista de IDs de projetos que ele pode acessar.
  const { rows: accessibleProjects } = await pool.query(
    `SELECT p.id FROM projeto p
     LEFT JOIN team t ON t.projeto_id = p.id
     LEFT JOIN usuario_team ut ON ut.team_id = t.id
     WHERE p.usuario_id = $1 OR ut.usuario_id = $1
     GROUP BY p.id`,
    [user.id]
  );
  
  const accessibleProjectIds = new Set(accessibleProjects.map(p => p.id));

  // 4. Filtra a lista de resultados da busca, mantendo apenas tarefas de projetos acessíveis.
  const filteredResults = allResults.filter(task => {
    // A função buscar_tarefas não retorna o projeto_id, então precisamos buscar
    // Vamos adicionar uma query para obter o projeto_id da tarefa
    // Esta é uma simplificação, o ideal seria a função no banco já retornar o projeto_id
    return pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [task.tarefa_id])
      .then(({ rows }) => rows.length > 0 && accessibleProjectIds.has(rows[0].projeto_id));
  });

  // Aguarda todas as verificações de permissão terminarem
  const finalResults = await Promise.all(filteredResults.map(async (task) => {
    const { rows } = await pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [task.tarefa_id]);
    if (rows.length > 0 && accessibleProjectIds.has(rows[0].projeto_id)) {
      return task;
    }
    return null;
  }));

  return finalResults.filter(task => task !== null);
}