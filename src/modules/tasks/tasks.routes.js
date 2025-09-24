import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const pump = promisify(pipeline);

async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
}

export async function taskRoutes(app) {
  
  // ROTA PARA UPLOAD DE ANEXO EM UMA TAREFA
  // POST /api/tasks/:taskId/attachments
  app.post('/:taskId/attachments', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    const { taskId } = request.params;
    const userId = request.session.user.id;

    // 1. Recebe o arquivo da requisição
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ message: 'Nenhum arquivo enviado.' });
    }

    // 2. Cria um nome de arquivo único para evitar sobreposição
    const uniqueFilename = `${Date.now()}-${data.filename}`;
    const uploadPath = path.join('uploads', uniqueFilename);

    // 3. Salva o arquivo no disco
    await pump(data.file, fs.createWriteStream(uploadPath));

    // 4. Insere os metadados do arquivo na tabela 'anexo'
    const { rows } = await app.db.query(
      'INSERT INTO anexo (nome_arquivo, caminho, tipo_mime, tamanho, tarefa_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.filename, uploadPath, data.mimetype, data.file.bytesRead, taskId, userId]
    );

    reply.status(201).send(rows[0]);
  });
}