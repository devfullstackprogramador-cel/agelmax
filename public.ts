import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(8).max(25),
  fulfillment: z.enum(['DELIVERY', 'PICKUP']),
  paymentMethod: z.enum(['PIX', 'PAYMENT_LINK', 'CASH', 'DEBIT_CARD_ON_SITE', 'CREDIT_CARD_ON_SITE']),
  deliveryZoneId: z.string().optional(),
  addressLine: z.string().trim().max(200).optional(),
  addressNumber: z.string().trim().max(30).optional(),
  addressComplement: z.string().trim().max(120).optional(),
  customerNotes: z.string().trim().max(500).optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(100) })).min(1).max(80),
});

export const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:slug/menu', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const tenant = await prisma.tenant.findFirst({ where: { slug, active: true }, select: { id: true, name: true, slug: true } });
    if (!tenant) return reply.code(404).send({ error: 'Estabelecimento não encontrado.' });
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id, active: true }, orderBy: { sortOrder: 'asc' },
      include: { products: { where: { tenantId: tenant.id, available: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, description: true, imageUrl: true, priceCents: true, categoryId: true } } },
    });
    return { tenant, categories };
  });

  app.post('/:slug/orders', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos.', details: parsed.error.flatten() });
    const input = parsed.data;
    const tenant = await prisma.tenant.findFirst({ where: { slug, active: true } });
    if (!tenant) return reply.code(404).send({ error: 'Estabelecimento não encontrado.' });

    if (input.fulfillment === 'DELIVERY' && (!input.deliveryZoneId || !input.addressLine || !input.addressNumber)) {
      return reply.code(400).send({ error: 'Para entrega, informe bairro, rua e número.' });
    }
    if (input.fulfillment === 'PICKUP' && input.deliveryZoneId) {
      return reply.code(400).send({ error: 'Retirada não deve incluir taxa de entrega.' });
    }

    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({ where: { tenantId: tenant.id, id: { in: productIds }, available: true } });
    if (products.length !== productIds.length) return reply.code(400).send({ error: 'Um ou mais produtos estão indisponíveis.' });
    const productById = new Map(products.map((product) => [product.id, product]));
    const lineItems = input.items.map((item) => {
      const product = productById.get(item.productId)!;
      return { productId: product.id, productName: product.name, unitPriceCents: product.priceCents, quantity: item.quantity, lineTotalCents: product.priceCents * item.quantity };
    });
    const subtotalCents = lineItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    let deliveryFeeCents = 0;
    if (input.fulfillment === 'DELIVERY') {
      const zone = await prisma.deliveryZone.findFirst({ where: { id: input.deliveryZoneId, tenantId: tenant.id, active: true } });
      if (!zone) return reply.code(400).send({ error: 'Bairro não atendido ou inválido.' });
      if (subtotalCents < zone.minimumOrderCents) return reply.code(400).send({ error: 'O pedido não atingiu o valor mínimo para este bairro.' });
      deliveryFeeCents = zone.feeCents;
    }

    // MVP: sequência do número do pedido deve ser trocada por sequence/contador transacional antes de produção.
    const previous = await prisma.order.findFirst({ where: { tenantId: tenant.id }, orderBy: { orderNumber: 'desc' }, select: { orderNumber: true } });
    const totalCents = subtotalCents + deliveryFeeCents;
    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id, orderNumber: (previous?.orderNumber ?? 1000) + 1,
        customerName: input.customerName, customerPhone: input.customerPhone,
        fulfillment: input.fulfillment, paymentMethod: input.paymentMethod,
        status: 'PENDING_PAYMENT', paymentStatus: 'PENDING', subtotalCents, deliveryFeeCents, totalCents,
        deliveryZoneId: input.fulfillment === 'DELIVERY' ? input.deliveryZoneId : undefined,
        addressLine: input.addressLine, addressNumber: input.addressNumber, addressComplement: input.addressComplement,
        customerNotes: input.customerNotes, items: { create: lineItems },
      },
      select: { id: true, orderNumber: true, status: true, paymentStatus: true, subtotalCents: true, deliveryFeeCents: true, totalCents: true, createdAt: true },
    });
    // Enfileirar notificação outbox/n8n após commit em etapa seguinte; não chamar WhatsApp dentro da transação de pedido.
    return reply.code(201).send({ order, message: 'Pedido registrado. Aguarde a confirmação do estabelecimento.' });
  });
};
