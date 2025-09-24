import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

import * as controller from './tasks.controller.js';
import * as projectRepository from '../projects/projects.repository.js';
import { pool } from '../../config/database.js'; // Import pool for direct use in middleware

// --- MIDDLEWARE DE SEGURANÇA ---
async function checkProjectAccess(request, reply) {
  console.log('\n--- 🛡️  Iniciando Middleware checkProjectAccess 🛡️ ---');
  const user = request.session.user;

  if (!user) {
    console.log('❌ [Middleware] Usuário não autenticado na sessão.');
    return reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
  console.log(`[Middleware] 👤 Usuário autenticado: ID ${user.id}, Tipo: ${user.tipo_usuario}`);
  console.log('[Middleware] URL Params recebidos:', request.params);

  let projectId = request.params.projectId;
  if (!projectId) {
    const { taskId } = request.params;
    if (!taskId || taskId === 'undefined') { // Verificação extra
      console.log('❌ [Middleware] ID da tarefa inválido ou indefinido.');
      return reply.status(400).send({ message: 'ID da tarefa inválido.' });
    }
    const taskResult = await pool.query('SELECT projeto_id FROM tarefa WHERE id = $1', [taskId]);
    if (taskResult.rows.length === 0) {
      console.log(`❌ [Middleware] Tarefa com ID ${taskId} não encontrada.`);
      return reply.status(404).send({ message: 'Tarefa não encontrada.' });
    }
    projectId = taskResult.rows[0].projeto_id;
  }
  
  console.log(`[Middleware] ➡️  Chamando repositório para verificar acesso ao projeto ID: ${projectId}`);
  const project = await projectRepository.findById(projectId, user);

  if (!project) {
    console.log('🚫 [Middleware] ACESSO BLOQUEADO. projectRepository.findById retornou null.');
    console.log('--- Fim do Middleware ---');
    return reply.status(403).send({ message: 'Você não tem permissão para acessar este projeto.' });
  }

  console.log('✅ [Middleware] Acesso PERMITIDO ao projeto:', project.nome);
  console.log('--- Fim do Middleware ---');
  request.project = project; 
}

const pump = promisify(pipeline);

export async function taskRoutes(app) {

 app.get('/projects/:projectId/tasks', { preHandler: [checkProjectAccess] }, controller.listTasksForProject);
  app.post('/projects/:projectId/tasks', { preHandler: [checkProjectAccess] }, controller.createTaskInProject);

  // --- ROTAS PARA UMA TAREFA INDIVIDUAL ---
  // A URL final será /api/tasks/:taskId
  app.get('/tasks/:taskId', { preHandler: [checkProjectAccess] }, controller.getTask);
  app.put('/tasks/:taskId', { preHandler: [checkProjectAccess] }, controller.updateTask);
  app.delete('/tasks/:taskId', { preHandler: [checkProjectAccess] }, controller.deleteTask);


  // --- ROTAS RELACIONADAS A ANEXOS (ATTACHMENTS) ---
  app.post('/:taskId/attachments', { preHandler: [checkProjectAccess] }, async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.session.user.id;

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ message: 'Nenhum arquivo enviado.' });
    }

    const uniqueFilename = `${Date.now()}-${data.filename}`;
    const uploadPath = path.join('uploads', uniqueFilename);

    await pump(data.file, fs.createWriteStream(uploadPath));

    const { rows } = await app.db.query(
      'INSERT INTO anexo (nome_arquivo, caminho, tipo_mime, tamanho, tarefa_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.filename, uploadPath, data.mimetype, data.file.bytesRead, taskId, userId]
    );

    reply.status(201).send(rows[0]);
  });
  
  app.post('/attachments/:attachmentId/resize', { preHandler: [checkProjectAccess] }, async (request, reply) => {
    try {
      const { attachmentId } = request.params;
      const { width } = request.query;

      const newWidth = parseInt(width);
      if (!newWidth || newWidth <= 0) {
        return reply.status(400).send({ message: 'Largura (width) inválida fornecida na query string.' });
      }

      const { rows } = await app.db.query('SELECT * FROM anexo WHERE id = $1', [attachmentId]);
      const attachment = rows[0];

      if (!attachment) {
        return reply.status(404).send({ message: 'Anexo não encontrado.' });
      }

      if (!attachment.tipo_mime.startsWith('image/')) {
        return reply.status(400).send({ message: 'O anexo não é uma imagem.' });
      }

      const originalPath = path.resolve(attachment.caminho);
      const fileExtension = path.extname(attachment.nome_arquivo);
      const baseFilename = path.basename(attachment.nome_arquivo, fileExtension);
      const newFilename = `${baseFilename}-${newWidth}w${fileExtension}`;
      const newPath = path.join('uploads', newFilename);
      
      await sharp(originalPath)
        .resize({ width: newWidth })
        .toFile(newPath);
      
      reply.send({ 
        message: 'Imagem redimensionada com sucesso!', 
        newPath: newPath
      });

    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ message: 'Ocorreu um erro ao redimensionar a imagem.' });
    }
  });

}