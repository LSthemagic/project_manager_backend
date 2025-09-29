import * as repository from './teams.repository.js';

export async function listTeamMembers(request, reply) {
  const { teamId } = request.params;
  const members = await repository.findMembersByTeamId(teamId);
  return reply.send(members);
}

export async function addTeamMember(request, reply) {
  const { teamId } = request.params;
  const { userId, papel } = request.body;
  const newMember = await repository.addUserToTeam({ teamId, userId, papel });
  return reply.status(201).send(newMember);
}

export async function removeTeamMember(request, reply) {
  const { teamId, userId } = request.params;
  const success = await repository.removeUserFromTeam({ teamId, userId });
  if (!success) {
    return reply.status(404).send({ message: 'Membro não encontrado no time.' });
  }
  return reply.status(204).send();
}
