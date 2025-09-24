import * as repository from './projects.repository.js';
import * as teamRepository from '../teams/teams.repository.js'; 

export async function listProjects(request, reply) {
  const user = request.session.user;
  const projects = await repository.findAll(user);
  reply.send(projects);
}

export async function getProject(request, reply) {
  const { id } = request.params;
  const user = request.session.user;
  
  // A lógica de progresso já está no repositório, então nenhuma mudança é necessária aqui
  const project = await repository.findById(id, user);

  if (!project) {
    return reply.status(404).send({ message: 'Projeto não encontrado ou acesso negado.' });
  }

  reply.send(project);
}

export async function createProject(request, reply) {
  const { nome, descricao, categoria_id } = request.body;
  const usuario_id = request.session.user.id;
  
  const newProject = await repository.create({ nome, descricao, categoria_id, usuario_id });
  reply.status(201).send(newProject);
}

export async function updateProject(request, reply) {
    const { id } = request.params;
    const updatedProject = await repository.update(id, request.body);
    if (!updatedProject) {
        return reply.status(404).send({ message: 'Projeto não encontrado.' });
    }
    reply.send(updatedProject);
}

export async function deleteProject(request, reply) {
    const { id } = request.params;
    const success = await repository.remove(id);
    if (!success) {
        return reply.status(404).send({ message: 'Projeto não encontrado.' });
    }
    reply.status(204).send();
}

export async function finishProject(request, reply) {
  try {
    const { id } = request.params;
    const userId = request.session.user.id;
    
    const success = await repository.finish(id, userId);

    if (success) {
      reply.send({ message: 'Projeto finalizado com sucesso!' });
    }
  } catch (error) {
    request.log.error(error);
    reply.status(400).send({ message: error.message });
  }
}