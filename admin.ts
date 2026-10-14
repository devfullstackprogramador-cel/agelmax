import type { FastifyPluginAsync } from 'fastify';
import { OrderStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const categorySchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(70).regex(/^[a-z0-9-]+$/),
  sortOrder: z.number().int().nonnegative().optional(),
});

const productSchema = z.object({
  tenantId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional().nullable(),
});

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/categories', async (request, reply) => {
    const { tenantId } = request.query as { tenantId?: string };
    if (!tenantId) return reply.code(400).send({ error: 'tenantId é obrigatório.' });
    return prisma.category.findMany({ where: { tenantId }, orderBy: { sortOrder: 'asc' } });
  });

  app.post('/categories', async (request, reply) => {
    const parsed = categorySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos.', details: parsed.error.flatten() });
    const tenant = await prisma.tenant.findUnique({ where: { id: parsed.data.tenantId } });
    if (!tenant) return reply.code(404).send({ error: 'Padaria não encontrada.' });
    try {
      return reply.code(201).send(await prisma.category.create({ data: parsed.data }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.code(409).send({ error: 'Já existe uma categoria com esse slug para esta padaria.' });
      }
      throw error;
    }
  });

  app.get('/products', async (request, reply) => {
    const { tenantId } = request.query as { tenantId?: string };
    if (!tenantId) return reply.code(400).send({ error: 'tenantId é obrigatório.' });
    return prisma.product.findMany({
      where: { tenantId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.post('/products', async (request, reply) => {
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos.', details: parsed.error.flatten() });
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, tenantId: parsed.data.tenantId },
    });
    if (!category) return reply.code(400).send({ error: 'Categoria inválida para esta padaria.' });
    return reply.code(201).send(await prisma.product.create({ data: parsed.data }));
  });

  app.patch('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = productSchema.omit({ tenantId: true }).partial().safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos.', details: parsed.error.flatten() });
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'Produto não encontrado.' });
    if (parsed.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: parsed.data.categoryId, tenantId: existing.tenantId },
      });
      if (!category) return reply.code(400).send({ error: 'Categoria inválida para esta padaria.' });
    }
    return prisma.product.update({ where: { id }, data: parsed.data });
  });

  app.get('/orders', async (request, reply) => {
    const { tenantId } = request.query as { tenantId?: string };
    if (!tenantId) return reply.code(400).send({ error: 'tenantId é obrigatório.' });
    return prisma.order.findMany({
      where: { tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  });

  app.patch('/orders/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = z.object({ status: z.nativeEnum(OrderStatus) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Status inválido.' });
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: 'Pedido não encontrado.' });
    return prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  });
};
