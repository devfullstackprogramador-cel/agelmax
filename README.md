# AgelMax Padaria

Cardápio digital para padarias, organizado como um monorepo TypeScript. O projeto inclui uma API Fastify, interface React, PostgreSQL com Prisma e um ambiente local simples de iniciar.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior (incluído nas versões atuais do Node.js)
- Docker Desktop, para executar o PostgreSQL localmente

## Início rápido (Windows PowerShell)

Na pasta `agelmax-padaria`, execute:

```powershell
npm install
Copy-Item api\.env.example api\.env
Copy-Item web\.env.example web\.env
docker compose up -d db
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Abra o endereço do Vite indicado no terminal (por padrão, http://localhost:5173). A API fica disponível em http://localhost:3333.

O comando `npm run dev` inicia a API e o frontend juntos. Para executar somente um deles, use `npm run dev:api` ou `npm run dev:web`.

> As credenciais nos arquivos `.env.example` e no Compose são apenas para desenvolvimento local. Não as reutilize em produção.

## Comandos úteis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia API e frontend em modo de desenvolvimento |
| `npm run build` | Compila os workspaces da API e do frontend |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:migrate` | Aplica/cria migrações locais |
| `npm run db:seed` | Carrega a padaria e os produtos de demonstração |
| `npm run db:studio` | Abre o Prisma Studio |
| `docker compose up -d db` | Inicia o PostgreSQL |
| `docker compose down` | Para os serviços locais |

Depois da migração inicial, rode `npm run db:migrate` sem `--name init` para criar migrações futuras. Para mudar a conexão da API, edite `api/.env`; para apontar o frontend a outra API ou padaria, edite `web/.env`.

## Estrutura

```text
agelmax-padaria/
├── api/                 # API Fastify, validação Zod e acesso a dados Prisma
│   ├── prisma/           # Schema e seed do banco
│   └── src/
│       ├── routes/       # Endpoints públicos e administrativos
│       ├── lib/          # Cliente Prisma
│       ├── app.ts        # Configuração e registro de rotas
│       └── server.ts     # Inicialização e encerramento gracioso
├── web/                 # Aplicação React + TypeScript + Vite
│   └── src/              # Interface e estilos
├── docs/                # Contratos e diretrizes do projeto
├── infra/n8n/           # Documentação de integrações planejadas
├── docker-compose.yml   # PostgreSQL para desenvolvimento local
└── package.json         # Workspaces e comandos comuns
```

O workspace ativo é composto por `api/` e `web/`. O diretório `apps/` guarda protótipos anteriores e não participa dos comandos nem do build do monorepo.

## Funcionalidades disponíveis

- Cardápio público por identificador (`VITE_TENANT_SLUG`).
- Categorias e produtos carregados pela API.
- Carrinho e checkout com preços validados no servidor.
- Cadastro de pedidos e consulta/atualização administrativa básica.
- Seed reproduzível para desenvolvimento local.

## Antes de publicar

Esta versão é uma base de desenvolvimento, não está pronta para receber tráfego real. As rotas administrativas ainda não exigem autenticação ou autorização por empresa. Antes de produção, implemente e teste autenticação, isolamento entre empresas, limites de requisição, proteção de webhooks, observabilidade, backups e os requisitos de privacidade/LGPD. Veja [docs/SECURITY.md](docs/SECURITY.md).
