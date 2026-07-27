import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

const port = await getAvailablePort();
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: "production" },
  stdio: "ignore",
});

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null) return Promise.resolve(true);
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(false), timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}

try {
  let response;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      response = await fetch(origin);
      if (response.ok) break;
    } catch {
      // The production server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  assert.ok(response?.ok, "Next.js production server did not become ready.");
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /财升宝智能化升级/);
  assert.match(html, /aria-label="财升宝APP智能化升级交互原型"/);

  const apiResponse = await fetch(`${origin}/api/recommendations?placement=discover-banner`);
  assert.equal(apiResponse.status, 200);
  const payload = await apiResponse.json();
  assert.equal(payload.placement, "discover-banner");
  assert.ok(Array.isArray(payload.items) && payload.items.length > 0);

  const imageResponse = await fetch(`${origin}/xiaobao-avatar.png`);
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get("content-type") ?? "", /^image\/png\b/i);

  console.log(`Production smoke test passed at ${origin}`);
} finally {
  server.kill("SIGTERM");
  const exited = await waitForExit(server, 2000);
  if (!exited) server.kill("SIGKILL");
}
