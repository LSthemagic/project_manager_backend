import * as repository from './categories.repository.js';

export async function listCategories(request, reply) {
  const categories = await repository.findAll();
  return reply.send(categories);
}

export async function getCategory(request, reply) {
  const { id } = request.params;
  const category = await repository.findById(id);
  if (!category) {
    return reply.status(404).send({ message: 'Categoria não encontrada.' });
  }
  return reply.send(category);
}

export async function createCategory(request, reply) {
  const newCategory = await repository.create(request.body);
  return reply.status(201).send(newCategory);
}

export async function updateCategory(request, reply) {
  const { id } = request.params;
  const updatedCategory = await repository.update(id, request.body);
  if (!updatedCategory) {
    return reply.status(404).send({ message: 'Categoria não encontrada.' });
  }
  return reply.send(updatedCategory);
}

export async function deleteCategory(request, reply) {
  const { id } = request.params;
  const success = await repository.remove(id);
  if (!success) {
    return reply.status(404).send({ message: 'Categoria não encontrada.' });
  }
  return reply.status(204).send();
}
