import * as repository from './projects.repository.js';
import * as teamRepository from '../teams/teams.repository.js'; 

export async function listProjects(request, reply) {
  const user = request.session.user;
  const projects = await repository.findAll(user);
  return reply.send(projects);
}

export async function getProject(request, reply) {
  const { id } = request.params;
  const user = request.session.user;
  
  const project = await repository.findById(id, user);

  if (!project) {
    return reply.status(404).send({ message: 'Projeto não encontrado ou acesso negado.' });
  }

  return reply.send(project);
}

export async function createProject(request, reply) {
  const {
    nome,
    descricao,
    categoria_id,
    data_inicio,
    data_fim,
    orcamento,
    prioridade,
    status
  } = request.body;
  const usuario_id = request.session.user.id;

  const newProject = await repository.create({
    nome,
    descricao,
    categoria_id,
    data_inicio,
    data_fim,
    orcamento,
    prioridade,
    status,
    usuario_id
  });
  return reply.status(201).send(newProject);
}

export async function updateProject(request, reply) {
    const { id } = request.params;
    const updatedProject = await repository.update(id, request.body);
    if (!updatedProject) {
        return reply.status(404).send({ message: 'Projeto não encontrado.' });
    }
    return reply.send(updatedProject);
}

export async function deleteProject(request, reply) {
    const { id } = request.params;
    const success = await repository.remove(id);
    if (!success) {
        return reply.status(404).send({ message: 'Projeto não encontrado.' });
    }
    return reply.status(204).send();
}

export async function finishProject(request, reply) {
  try {
    const { id } = request.params;
    const userId = request.session.user.id;
    
    const success = await repository.finish(id, userId);

    if (success) {
      return reply.send({ message: 'Projeto finalizado com sucesso!' });
    }
  } catch (error) {
    request.log.error(error);
    return reply.status(400).send({ message: error.message });
  }
}
