import * as repository from './projects.repository.js';
// Reutilizando o repositório de times para verificar permissões
import * as teamRepository from '../teams/teams.repository.js'; 

export async function listProjects(request, reply) {
  const user = request.session.user;
  const projects = await repository.findAll(user);
  reply.send(projects);
}

export async function getProject(request, reply) {
  const { id } = request.params;
  const user = request.session.user;
  
  const project = await repository.findById(id);
  if (!project) {
    return reply.status(404).send({ message: 'Projeto não encontrado.' });
  }

  // Se não for admin/gerente, precisa verificar o acesso
  if (user.tipo_usuario === 'comum') {
    if (project.usuario_id !== user.id) {
      const teams = await teamRepository.findTeamsByProjectId(id);
      const isMember = teams.some(team => team.user_id === user.id);
      if (!isMember) {
        return reply.status(403).send({ message: 'Acesso negado a este projeto.' });
      }
    }
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