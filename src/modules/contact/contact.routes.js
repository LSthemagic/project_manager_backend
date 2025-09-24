import { sendContactEmail } from '../../lib/mailer.js';

export async function contactRoutes(app) {
  
  app.post('/', async (request, reply) => {
    try {
      const { nome, email, mensagem } = request.body;

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