import bcrypt from 'bcrypt';

// Helper: Middleware para verificar se o usuário está autenticado
// Vamos usar isso para proteger as rotas de update
async function ensureAuthenticated(request, reply) {
  if (!request.session.user) {
    reply.status(401).send({ message: 'Acesso negado. Por favor, faça login.' });
  }
}

export async function authRoutes(app) {
  
  // --- ROTA DE REGISTRO DE NOVO USUÁRIO ---
  app.post('/register', async (request, reply) => {
    const { nome, email, senha } = request.body;

    // 1. Verifica se o email já existe
    const { rows: existingUsers } = await app.db.query(
      'SELECT id FROM usuario WHERE email = $1',
      [email]
    );

    if (existingUsers.length > 0) {
      return reply.status(409).send({ message: 'Este email já está em uso.' });
    }

    // 2. Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10); // 10 é o "custo" do hash

    // 3. Insere o novo usuário no banco
    const { rows } = await app.db.query(
      'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, tipo_usuario',
      [nome, email, hashedPassword]
    );
    const newUser = rows[0];

    reply.status(201).send({ message: 'Usuário criado com sucesso!', user: newUser });
  });

  // --- ROTA DE LOGIN (Atualizada com nome da tabela em minúsculo) ---
  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body;
    const { rows } = await app.db.query('SELECT * FROM usuario WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return reply.status(401).send({ message: 'Email ou senha inválidos.' });
    }

    const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
    if (!isPasswordCorrect) {
      return reply.status(401).send({ message: 'Email ou senha inválidos.' });
    }

    request.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
    };

    return reply.send({ message: 'Login bem-sucedido!', user: request.session.user });
  });

  // --- ROTAS PARA O USUÁRIO LOGADO (/me) ---
  app.get('/me', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    // Graças ao preHandler, este código só roda se o usuário estiver logado
    return reply.send({ user: request.session.user });
  });

  app.put('/me', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    const userId = request.session.user.id;
    const { nome, email } = request.body; // Campos que o usuário pode atualizar

    // Atualiza nome e email no banco
    const { rows } = await app.db.query(
      'UPDATE usuario SET nome = $1, email = $2, data_atualizacao = NOW() WHERE id = $3 RETURNING id, nome, email, tipo_usuario',
      [nome, email, userId]
    );
    const updatedUser = rows[0];

    // Atualiza a sessão com os novos dados
    request.session.user = updatedUser;

    return reply.send({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  });

  // --- ROTA PARA TROCAR A SENHA ---
  app.put('/change-password', { preHandler: [ensureAuthenticated] }, async (request, reply) => {
    const userId = request.session.user.id;
    const { senhaAtual, novaSenha } = request.body;

    // 1. Busca a senha atual no banco
    const { rows } = await app.db.query('SELECT senha FROM usuario WHERE id = $1', [userId]);
    const user = rows[0];

    // 2. Verifica se a senha atual está correta
    const isPasswordCorrect = await bcrypt.compare(senhaAtual, user.senha);
    if (!isPasswordCorrect) {
      return reply.status(401).send({ message: 'A senha atual está incorreta.' });
    }

    // 3. Criptografa e atualiza a nova senha
    const hashedNewPassword = await bcrypt.hash(novaSenha, 10);
    await app.db.query('UPDATE usuario SET senha = $1 WHERE id = $2', [hashedNewPassword, userId]);
    
    // Por segurança, destruímos a sessão para forçar um novo login com a nova senha
    await request.session.destroy();

    return reply.send({ message: 'Senha alterada com sucesso! Por favor, faça login novamente.' });
  });

  // --- ROTA DE LOGOUT ---
  app.post('/logout', async (request, reply) => {
    try {
      await request.session.destroy();
      return reply.send({ message: 'Logout realizado com sucesso.' });
    } catch (err) {
      return reply.status(500).send({ message: 'Erro ao fazer logout.' });
    }
  });
}