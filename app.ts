import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from './lib/prisma.js';
import { adminRoutes } from './routes/admin.js';
import { publicRoutes } from './routes/public.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.WEB_ORIGIN || 'http://localhost:5173',
  });

  app.get('/health', async () => ({ status: 'ok', service: 'agelmax-padaria-api' }));
  await app.register(publicRoutes, { prefix: '/api/public' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
