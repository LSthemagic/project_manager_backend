import bcrypt from 'bcrypt';
import { updatePreferences } from '../users/users.repository.js';

async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
}

export async function authRoutes(app) {
  
  app.post('/register', async (request, reply) => {
    const { nome, email, senha } = request.body;

    const { rows: existingUsers } = await app.db.query(
      'SELECT id FROM usuario WHERE email = $1',
      [email]
    );

    if (existingUsers.length > 0) {
      return reply.status(409).send({ message: 'Este email já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const { rows } = await app.db.query(
      'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, tipo_usuario',
      [nome, email, hashedPassword]
    );
    const newUser = rows[0];

    reply.status(201).send({ message: 'Usuário criado com sucesso!', user: newUser });
  });

  app.post('/login', async (request, reply) => {
    const { email, senha, rememberMe } = request.body;
    const { rows } = await app.db.query('SELECT * FROM usuario WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return reply.status(401).send({ message: 'Email ou senha inválidos.' });
    }

    const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
    if (!isPasswordCorrect) {
      return reply.status(401).send({ message: 'Email ou senha inválidos.' });
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // Apenas definimos os dados do usuário na sessão.
    // A configuração do cookie (maxAge, etc.) será gerenciada globalmente pelo app.js.
    request.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
    };
    
    console.log(`User ${user.email} logged in. Remember me: ${rememberMe ? 'Yes' : 'No'}`);

    return reply.send({
      message: 'Login bem-sucedido!',
      user: request.session.user,
    });
  });

  app.put('/me/preferences', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    const userId = request.session.user.id;
    const preferences = request.body;

    const updatedUser = await updatePreferences(userId, preferences);

    request.session.user.preferencias = updatedUser.preferencias;

    reply.send({ message: 'Preferências atualizadas com sucesso!', preferences: updatedUser.preferencias });
  });

  app.get('/me', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    return reply.send({
      user: request.session.user,
      sessionInfo: {
        maxAge: request.session.cookie.maxAge,
        created: request.session.createdAt,
        expires: new Date(Date.now() + request.session.cookie.maxAge).toISOString()
      }
    });
  });

  // Rota para verificar status da sessão (útil para debug)
  app.get('/session-status', async (request, reply) => {
    const hasSession = !!request.session;
    const hasUser = !!(request.session && request.session.user);

    return reply.send({
      hasSession,
      hasUser,
      sessionId: request.session?.sessionId || null,
      user: hasUser ? {
        id: request.session.user.id,
        email: request.session.user.email,
        nome: request.session.user.nome
      } : null,
      sessionInfo: hasSession ? {
        maxAge: request.session.cookie.maxAge,
        expires: new Date(Date.now() + request.session.cookie.maxAge).toISOString()
      } : null
    });
  });

  app.put('/me', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    const userId = request.session.user.id;
    const { nome, email } = request.body;

    const { rows } = await app.db.query(
      'UPDATE usuario SET nome = $1, email = $2, data_atualizacao = NOW() WHERE id = $3 RETURNING id, nome, email, tipo_usuario',
      [nome, email, userId]
    );
    const updatedUser = rows[0];

    request.session.user = updatedUser;

    return reply.send({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  });

  app.put('/change-password', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    const userId = request.session.user.id;
    const { senhaAtual, novaSenha } = request.body;

    const { rows } = await app.db.query('SELECT senha FROM usuario WHERE id = $1', [userId]);
    const user = rows[0];

    const isPasswordCorrect = await bcrypt.compare(senhaAtual, user.senha);
    if (!isPasswordCorrect) {
      return reply.status(401).send({ message: 'A senha atual está incorreta.' });
    }

    const hashedNewPassword = await bcrypt.hash(novaSenha, 10);
    await app.db.query('UPDATE usuario SET senha = $1 WHERE id = $2', [hashedNewPassword, userId]);
    
    await request.session.destroy();

    return reply.send({ message: 'Senha alterada com sucesso! Por favor, faça login novamente.' });
  });

  app.post('/logout', async (request, reply) => {
    try {
      const userEmail = request.session?.user?.email || 'unknown';
      console.log(`User ${userEmail} logging out`);

      if (request.session) {
        await request.session.destroy();
      }

      // Limpar cookie explicitamente
      reply.clearCookie('sessionId');

      return reply.send({
        message: 'Logout realizado com sucesso.',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error during logout:', err);
      return reply.status(500).send({
        message: 'Erro ao fazer logout.',
        error: err.message
      });
    }
  });
}