import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'padaria-demo' },
    update: {},
    create: { name: 'Padaria AgelMax', slug: 'padaria-demo', phone: '(13) 99999-0000' }
  });
  const categories = [
    { name: 'Pães', slug: 'paes', sortOrder: 1 },
    { name: 'Salgados', slug: 'salgados', sortOrder: 2 },
    { name: 'Doces', slug: 'doces', sortOrder: 3 },
    { name: 'Bebidas', slug: 'bebidas', sortOrder: 4 }
  ];
  for (const category of categories) {
    await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: category.slug } },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: { ...category, tenantId: tenant.id }
    });
  }
  const allCategories = await prisma.category.findMany({ where: { tenantId: tenant.id } });
  const products = [
    { name: 'Pão francês (un.)', description: 'Crocante por fora, macio por dentro.', priceCents: 80, category: 'paes', featured: true },
    { name: 'Pão de queijo', description: 'Assado na hora, com queijo.', priceCents: 450, category: 'paes', featured: true },
    { name: 'Coxinha de frango', description: 'Recheio cremoso e massa dourada.', priceCents: 750, category: 'salgados', featured: true },
    { name: 'Esfiha de carne', description: 'Temperada e assada diariamente.', priceCents: 650, category: 'salgados', featured: false },
    { name: 'Sonho de creme', description: 'Massa leve com creme de confeiteiro.', priceCents: 700, category: 'doces', featured: true },
    { name: 'Brigadeiro', description: 'Clássico, feito com chocolate.', priceCents: 350, category: 'doces', featured: false },
    { name: 'Café coado', description: 'Café quentinho, 200 ml.', priceCents: 400, category: 'bebidas', featured: false },
    { name: 'Suco de laranja', description: 'Suco natural, 300 ml.', priceCents: 850, category: 'bebidas', featured: false }
  ];
  for (const p of products) {
    const category = allCategories.find(c => c.slug === p.category)!;
    const exists = await prisma.product.findFirst({ where: { tenantId: tenant.id, name: p.name } });
    if (!exists) await prisma.product.create({ data: { tenantId: tenant.id, categoryId: category.id, name: p.name, description: p.description, priceCents: p.priceCents, featured: p.featured } });
  }
  console.log(`Seed concluído: ${tenant.name} (${tenant.slug})`);
}
main().finally(() => prisma.$disconnect());
