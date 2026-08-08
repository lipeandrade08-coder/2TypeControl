# 2Type Control

Central de operação para restaurantes que reúne pedidos do site e WhatsApp,
salão, cardápio, entregas, relatórios e histórico de clientes em uma única
interface.

## Tecnologias

- React 19 e vinext (App Router compatível com Next.js)
- Cloudflare Workers e D1
- Drizzle ORM
- Tailwind CSS 4
- TypeScript e ESLint

## Como executar

Requer Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Validação completa:

```bash
npm run check
```

O comando executa lint, verificação de tipos, build de produção e testes
automatizados.

## Persistência

Os pedidos recebidos por `/api/orders` são armazenados no D1 por meio do
binding `DB`, declarado em `.openai/hosting.json`. A tabela e o índice usados
pela listagem são inicializados de forma idempotente, e as migrações SQL ficam
em `drizzle/`.

Valores monetários são persistidos como centavos e expostos pela API em reais.

## Integração de pedidos

Copie `.env.example` para um arquivo local ignorado pelo Git e configure:

- `ORDERS_ALLOWED_ORIGINS`: lista de origens externas autorizadas, separadas
  por vírgula. A origem da própria aplicação já é permitida.
- `ORDERS_API_KEY`: chave opcional exigida no header `X-API-Key` para criar
  pedidos. Em produção, recomenda-se configurá-la para integrações servidor a
  servidor.

Exemplo de corpo aceito por `POST /api/orders`:

```json
{
  "customer": "Marina Alves",
  "channel": "Site",
  "detail": "2 pizzas e 1 refrigerante",
  "total": 94.7,
  "time": "agora",
  "status": "Novo",
  "feePending": true
}
```

## Estrutura principal

- `app/restaurant-dashboard.tsx`: experiência operacional e interações
- `app/api/orders/`: contrato e rotas da API de pedidos
- `db/`: schema e acesso ao D1
- `drizzle/`: migrações SQL
- `tests/`: testes do produto e do contrato da API
- `worker/`: entrada do Cloudflare Worker

## Estado do produto

O painel já oferece uma demonstração navegável das áreas operacionais. Pedidos
recebidos pela API são persistentes; os demais módulos ainda usam dados de
demonstração e devem ganhar modelos próprios no D1 conforme o produto evoluir.
