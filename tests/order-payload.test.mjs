import assert from "node:assert/strict";
import test from "node:test";

import { parseOrderPayload } from "../app/api/orders/order-payload.ts";

test("normaliza um pedido válido e persiste o total em centavos", () => {
  const result = parseOrderPayload({
    customer: "  Marina Alves  ",
    channel: "WhatsApp",
    detail: "2 pizzas",
    total: 94.7,
    status: "Novo",
    feePending: true,
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      customer: "Marina Alves",
      channel: "WhatsApp",
      detail: "2 pizzas",
      total: 9470,
      time: "agora",
      status: "Novo",
      feePending: true,
    },
  });
});

test("rejeita campos fora do contrato", () => {
  assert.deepEqual(parseOrderPayload({ channel: "Marketplace" }), {
    ok: false,
    error: "channel inválido.",
  });
  assert.deepEqual(parseOrderPayload({ total: -1 }), {
    ok: false,
    error: "total deve ser um número entre 0 e 1.000.000.",
  });
  assert.equal(
    parseOrderPayload({ customer: "x".repeat(121) }).ok,
    false,
  );
});
