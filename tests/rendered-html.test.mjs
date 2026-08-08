import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renderiza a central 2Type Control", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="pt-BR"/i);
  assert.match(html, /<title>2Type Control — Central do restaurante<\/title>/i);
  assert.match(html, /2TYPE CONTROL · CENTRAL DE OPERAÇÃO/);
  assert.match(html, /Bom dia, Rafael!/);
  assert.match(html, /Pedidos agora/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("mantém a configuração do produto pronta para Sites", async () => {
  const [hosting, packageJson] = await Promise.all([
    readFile(new URL(".openai/hosting.json", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
  ]);

  const hostingConfig = JSON.parse(hosting);
  assert.equal(hostingConfig.d1, "DB");
  assert.equal(hostingConfig.r2, null);
  assert.match(hostingConfig.project_id, /^appgprj_[a-z0-9]+$/);
  assert.equal(JSON.parse(packageJson).name, "2type-control");
  await access(new URL("build/sites-vite-plugin.ts", projectRoot));
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
