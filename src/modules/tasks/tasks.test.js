import { buildApp } from '../../app.js';
import supertest from 'supertest';
import { pool } from '../../config/database.js';

describe('Tasks API', () => {
  let app;
  let agent;
  let newTaskId;

  const PROJECT_ID_USER_HAS_ACCESS = 1;
  const PROJECT_ID_USER_HAS_NO_ACCESS = 2;
  const USER_ID_WITH_ACCESS = 3;
  const STATUS_ID_INITIAL = 1;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    agent = supertest.agent(app.server);

    await agent.post('/api/auth/login').send({
      email: 'pedro@email.com',
      senha: 'nova_senha_mais_forte_ainda',
    });
  });

  afterAll(async () => {
    if (newTaskId) {
      await pool.query('DELETE FROM tarefa WHERE id = $1', [newTaskId]);
    }
    await app.close();
    await pool.end();
  });


  describe('Project Tasks (/api/projects/:projectId/tasks)', () => {

    it('should NOT create a task for a project the user has no access to and return 403', async () => {
      const response = await agent
        .post(`/api/projects/${PROJECT_ID_USER_HAS_NO_ACCESS}/tasks`)
        .send({
          titulo: 'Tarefa Maliciosa',
          responsavel_id: USER_ID_WITH_ACCESS,
          status_id: STATUS_ID_INITIAL,
        });
      
      expect(response.status).toBe(403);
    });
    
    it('should list tasks for an authorized user and return 200', async () => {
      const response = await agent
        .get(`/api/projects/${PROJECT_ID_USER_HAS_ACCESS}/tasks`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a task for an authorized user and return 201', async () => {
      const response = await agent
        .post(`/api/projects/${PROJECT_ID_USER_HAS_ACCESS}/tasks`)
        .send({
          titulo: 'Tarefa Criada Corretamente',
          descricao: 'Esta é uma tarefa criada pelo teste.',
          responsavel_id: USER_ID_WITH_ACCESS,
          status_id: STATUS_ID_INITIAL,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      newTaskId = response.body.id;
    });
  });

  describe('Individual Tasks (/api/tasks/:taskId)', () => {
    
    it('should update the created task and return 200', async () => {
      expect(newTaskId).toBeDefined(); 

      const response = await agent
        .put(`/api/tasks/${newTaskId}`)
        .send({
          titulo: 'Tarefa de Teste Atualizada',
          descricao: 'Descrição foi atualizada.',
          responsavel_id: USER_ID_WITH_ACCESS,
          status_id: STATUS_ID_INITIAL,
        });

      expect(response.status).toBe(200);
      expect(response.body.titulo).toBe('Tarefa de Teste Atualizada');
    });
  
    it('should delete the created task and return 204', async () => {
      expect(newTaskId).toBeDefined();

      const response = await agent
        .delete(`/api/tasks/${newTaskId}`);

      expect(response.status).toBe(204);

      newTaskId = null; 
    });
  });
});