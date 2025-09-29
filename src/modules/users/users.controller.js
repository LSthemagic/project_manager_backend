import bcrypt from 'bcrypt';
import * as repository from './users.repository.js';

export async function listUsers(request, reply) {
  const users = await repository.findAll();
  return reply.send(users);
}

export async function getUser(request, reply) {
  const { id } = request.params;
  const user = await repository.findById(id);
  if (!user) {
    return reply.status(404).send({ message: 'Usuário não encontrado.' });
  }
  return reply.send(user);
}

export async function createUser(request, reply) {
  const { nome, email, senha, tipo_usuario } = request.body;

  const hashedPassword = await bcrypt.hash(senha, 10);

  const newUser = await repository.create({
    nome,
    email,
    hashedPassword,
    tipo_usuario,
  });
  return reply.status(201).send(newUser);
}

export async function updateUser(request, reply) {
  const { id } = request.params;
  const updatedUser = await repository.update(id, request.body);
  if (!updatedUser) {
    return reply.status(404).send({ message: 'Usuário não encontrado.' });
  }
  return reply.send(updatedUser);
}

export async function deleteUser(request, reply) {
  const { id } = request.params;
  const success = await repository.remove(id);
  if (!success) {
    return reply.status(404).send({ message: 'Usuário não encontrado.' });
  }
  return reply.status(204).send();
}
