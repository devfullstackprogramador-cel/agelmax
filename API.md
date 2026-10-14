# Contrato atual da API

## Rotas implementadas

- `GET /health` — verificação da API.
- `GET /api/public/:slug/menu` — informações públicas do estabelecimento, categorias e produtos disponíveis.
- `POST /api/public/:slug/orders` — cria pedido após validar produtos e preços; a taxa demonstrativa de entrega é definida no servidor.
- `GET /api/admin/categories?tenantId=...` e `POST /api/admin/categories` — consulta e cadastro de categorias.
- `GET /api/admin/products?tenantId=...`, `POST /api/admin/products` e `PATCH /api/admin/products/:id` — consulta e manutenção de produtos.
- `GET /api/admin/orders?tenantId=...` e `PATCH /api/admin/orders/:id/status` — consulta de pedidos e atualização de status.

As rotas `/api/admin/*` são apenas para desenvolvimento e atualmente não possuem autenticação nem autorização. Não as exponha publicamente.

## Planejadas (a implementar)

- `POST /api/auth/login`
- `GET /api/admin/delivery-zones`
- `POST /api/admin/delivery-zones`
- `POST /api/admin/whatsapp/connect`
- `GET /api/admin/whatsapp/status`

## Integrações planejadas
- `POST /api/webhooks/evolution/:instanceKey`
- `POST /api/webhooks/payments/asaas`
- `POST /api/webhooks/payments/mercadopago`

Requisitos de produção: autenticação e autorização, validação de assinatura/segredo, idempotência, rate limiting, logs sem dados sensíveis e política de retenção. Consulte [SECURITY.md](SECURITY.md).
