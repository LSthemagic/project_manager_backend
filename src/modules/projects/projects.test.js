import { buildApp } from '../../app.js';
import supertest from 'supertest';

describe('Projects API', () => {
  let app;
  let adminCookie;
  let commonUserCookie;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const adminLoginResponse = await supertest(app.server).post('/api/auth/login').send({
      email: 'novo.silva@email.com',
      senha: 'nova_senha_mais_forte_ainda'
    });
    adminCookie = adminLoginResponse.headers['set-cookie'];

    const commonUserLoginResponse = await supertest(app.server).post('/api/auth/login').send({
      email: 'pedro@email.com',
      senha: 'nova_senha_mais_forte_ainda'
    });
    commonUserCookie = commonUserLoginResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/projects', () => {
    it('should return 403 for common user', async () => {
      const response = await supertest(app.server)
        .post('/api/projects')
        .set('Cookie', commonUserCookie)
        .send({ nome: 'Teste de Permissão', descricao: '...', categoria_id: 1 });
      
      expect(response.status).toBe(403);
    });

    it('should return 201 for admin user and create a project', async () => {
        const response = await supertest(app.server)
        .post('/api/projects')
        .set('Cookie', adminCookie)
        .send({ nome: 'Novo Projeto de Teste', descricao: 'Descrição do projeto.', categoria_id: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe('Novo Projeto de Teste');
    });
  });

  describe('GET /api/projects', () => {
      it('should return a list of projects for an admin', async () => {
          const response = await supertest(app.server)
              .get('/api/projects')
              .set('Cookie', adminCookie);
          
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
      });
  });
});