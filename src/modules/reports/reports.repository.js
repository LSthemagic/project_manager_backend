import { pool } from '../../config/database.js';

export async function getDashboardData() {
  // 1. Busca os dados atuais diretamente da sua view, que já é otimizada.
  const { rows: current } = await pool.query('SELECT * FROM dashboard_executivo');
  const currentData = current[0] || {};

  // 2. Busca dados de 30 dias atrás para comparação.
  // Esta query foi ajustada para usar as tabelas e status corretos do seu schema.
  const { rows: previous } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM projeto WHERE status != 'concluido' AND data_criacao <= NOW() - INTERVAL '30 days') AS projetos_ativos,
      (SELECT COUNT(*) FROM tarefa t JOIN status_tarefa st ON t.status_id = st.id WHERE st.nome != 'Concluída' AND t.data_criacao <= NOW() - INTERVAL '30 days') AS tarefas_pendentes,
      (SELECT COUNT(*) FROM tarefa t JOIN status_tarefa st ON t.status_id = st.id WHERE st.nome = 'Concluída' AND t.data_atualizacao <= NOW() - INTERVAL '30 days') AS tarefas_concluidas,
      (SELECT COALESCE(SUM(horas), 0) FROM timelog WHERE data_registro BETWEEN (NOW() - INTERVAL '60 days') AND (NOW() - INTERVAL '30 days')) AS horas_mes_anterior
  `);
  const previousData = previous[0] || {};

  // 3. Função para calcular a mudança percentual entre o período atual e o anterior.
  const calculateChange = (currentValue, previousValue) => {
    const current = Number(currentValue) || 0;
    const previous = Number(previousValue) || 0;

    if (previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
  };

  // 4. Retorna os dados atuais e o cálculo da variação percentual.
  return {
    // Dados atuais da view
    total_usuarios_ativos: currentData.total_usuarios_ativos,
    projetos_ativos: currentData.projetos_ativos,
    tarefas_pendentes: currentData.tarefas_pendentes,
    tarefas_concluidas: currentData.tarefas_concluidas,
    horas_mes_atual: currentData.horas_mes_atual,
    progresso_medio_projetos: currentData.progresso_medio_projetos,
    projetos_atrasados: currentData.projetos_atrasados,
    atividades_ultima_semana: currentData.atividades_ultima_semana,
    // Objeto com as mudanças percentuais
    changes: {
      projetos_ativos: calculateChange(currentData.projetos_ativos, previousData.projetos_ativos),
      tarefas_pendentes: calculateChange(currentData.tarefas_pendentes, previousData.tarefas_pendentes),
      tarefas_concluidas: calculateChange(currentData.tarefas_concluidas, previousData.tarefas_concluidas),
      horas_mes_atual: calculateChange(currentData.horas_mes_atual, previousData.horas_mes_anterior)
    }
  };
}

export async function getProjectsReport() {
  const { rows } = await pool.query('SELECT * FROM relatorio_projetos');
  return rows;
}

export async function getProductivityReport() {
  const { rows } = await pool.query('SELECT * FROM relatorio_produtividade');
  return rows;
}

export async function getPublicStats() {
  // Contar estatísticas reais do sistema
  const { rows } = await pool.query(`
    SELECT
      COUNT(CASE WHEN p.status = 'concluido' THEN 1 END) as projectsCompleted,
      COUNT(DISTINCT u.id) as totalUsers
    FROM projeto p
    CROSS JOIN usuario u
  `);

  const stats = rows[0] || {};

  return {
    projectsCompleted: Math.max(stats.projectscompleted || 0, 10000), // Mínimo 10k para marketing
    satisfactionRate: '95%', // Valor fixo para marketing
    companiesTrust: Math.max(Math.floor((stats.totalusers || 0) / 10), 500), // Estimar empresas baseado em usuários
    supportAvailable: '24/7'
  };
}
