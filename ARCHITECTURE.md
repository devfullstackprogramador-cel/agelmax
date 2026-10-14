# Arquitetura

## Visão geral

O repositório é um monorepo npm com dois workspaces independentes e contratos explícitos entre navegador e servidor:

- **`web/`**: aplicação React + TypeScript. Apresenta o cardápio, mantém o carrinho no navegador e envia os pedidos à API. A URL da API e o slug da padaria são configuráveis por `VITE_API_URL` e `VITE_TENANT_SLUG`.
- **`api/`**: aplicação Fastify + TypeScript. Expõe endpoints HTTP, valida entradas com Zod e usa Prisma para persistência. Variáveis locais são carregadas de `api/.env`.
- **`api/src/app.ts`**: configuração do Fastify e registro dos plugins/rotas.
- **`api/src/routes/`**: endpoints separados por domínio público e administrativo.
- **`api/src/lib/prisma.ts`**: cliente Prisma compartilhado pela API.
- **`api/prisma/`**: schema PostgreSQL e seed de dados demonstrativos.
- **`infra/`**: documentação das integrações planejadas, sem credenciais ou execução automática.
- **`docs/`**: contrato da API, checklist de segurança e esta visão arquitetural.

## Fluxo principal

1. O frontend solicita à API o cardápio público da padaria configurada.
2. O cliente seleciona produtos e envia identificadores e quantidades junto aos dados necessários para o checkout.
3. A API valida os dados e consulta os produtos no banco; os preços e a taxa demonstrativa fixa de entrega são calculados no servidor.
4. O Prisma grava o pedido e seus itens no PostgreSQL.

## Limites e evolução

Os workspaces são executados, compilados e configurados separadamente, mas compartilham os comandos npm da raiz. A comunicação entre eles é HTTP/JSON; os modelos internos do Prisma não devem ser usados como contrato do frontend.

As rotas estão separadas por domínio, enquanto as regras de negócio pequenas permanecem próximas aos handlers. Ao crescer, extraia serviços e esquemas compartilhados em módulos próprios. Integrações com pagamentos e mensageria devem ser adicionadas por adaptadores e processadas com idempotência; não devem bloquear a criação do pedido.

`apps/` contém uma implementação anterior incompleta, fora dos workspaces ativos. Use `api/` e `web/` como fontes de verdade até uma migração deliberada desse protótipo.
