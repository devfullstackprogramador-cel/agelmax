# Checklist de segurança antes de produção

- [ ] Trocar todos os segredos de exemplo e não versionar `.env`.
- [ ] TLS/HTTPS em todos os domínios e painel administrativo.
- [ ] Autenticação robusta, hash de senha com Argon2id/bcrypt e proteção contra brute force.
- [ ] Autorização tenant-scoped em cada consulta e mutação.
- [ ] Avaliar PostgreSQL Row Level Security como defesa adicional.
- [ ] Rate limit e validação Zod nas rotas públicas.
- [ ] Assinatura/token e idempotência em todos os webhooks.
- [ ] Preços, taxa e total recalculados no servidor.
- [ ] Não armazenar dados completos de cartão.
- [ ] Backups criptografados e teste de restauração.
- [ ] Logs, alertas, atualização de imagens e dependências.
- [ ] Consentimento, política de privacidade e retenção compatíveis com LGPD.
- [ ] Separar mensagens para proprietário, cozinha e entregador por permissões.
- [ ] Usar uma fila/outbox para notificações; não perder pedido se o WhatsApp cair.
- [ ] Testes de concorrência para número do pedido e estoque.
