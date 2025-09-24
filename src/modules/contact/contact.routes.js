import { sendContactEmail } from '../../lib/mailer.js';

export async function contactRoutes(app) {
  
  // ROTA PÚBLICA PARA O FORMULÁRIO DE CONTATO
  // POST /api/contact
  app.post('/', async (request, reply) => {
    try {
      const { nome, email, mensagem } = request.body;

      // Validação simples
      if (!nome || !email || !mensagem) {
        return reply.status(400).send({ message: 'Todos os campos são obrigatórios.' });
      }

      await sendContactEmail({ nome, email, mensagem });

      reply.status(200).send({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({ message: 'Ocorreu um erro ao enviar a mensagem.' });
    }
  });
}