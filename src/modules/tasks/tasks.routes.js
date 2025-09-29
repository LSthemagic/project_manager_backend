import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import * as controller from './tasks.controller.js';
import { checkProjectAccess } from '../../middleware/auth.middleware.js';

const pump = promisify(pipeline);

export async function taskRoutes(app) {
  app.get('/task-statuses', controller.getTaskStatuses);

  app.get('/projects/:projectId/tasks', { preHandler: [checkProjectAccess] }, controller.listTasksForProject);
  app.post('/projects/:projectId/tasks', { preHandler: [checkProjectAccess] }, controller.createTaskInProject);

  app.get('/tasks/:taskId', { preHandler: [checkProjectAccess] }, controller.getTask);
  app.put('/tasks/:taskId', { preHandler: [checkProjectAccess] }, controller.updateTask);
  app.delete('/tasks/:taskId', { preHandler: [checkProjectAccess] }, controller.deleteTask);

  // --- ROTA ADICIONADA E CORRIGIDA AQUI ---
  app.get('/tasks/:taskId/attachments', { preHandler: [checkProjectAccess] }, controller.listAttachmentsForTask);

  app.post('/tasks/:taskId/attachments', { preHandler: [checkProjectAccess] }, async (request, reply) => {
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

    return reply.status(201).send(rows[0]);
  });

  app.post('/attachments/:attachmentId/resize',  async (request, reply) => {
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

      

      return reply.send({
        message: 'Imagem redimensionada com sucesso!',
        newPath: newPath
      });

    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: 'Ocorreu um erro ao redimensionar a imagem.' });
    }
  });

  app.get('/tasks/:taskId/tags', { preHandler: [checkProjectAccess] }, controller.listTaskTags);
  app.post('/tasks/:taskId/tags', { preHandler: [checkProjectAccess] }, controller.addTaskTag);
  app.delete('/tasks/:taskId/tags/:tagId', { preHandler: [checkProjectAccess] }, controller.removeTaskTag);
}