import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("the public homepage renders without crashing", async () => {
  globalThis.window = {
    location: { pathname: "/", search: "", hash: "", origin: "https://example.test" },
    history: { replaceState() {} },
    scrollTo() {},
  };

  const vite = await createServer({
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });

  try {
    const { App } = await vite.ssrLoadModule("/src/App.jsx");
    const html = renderToStaticMarkup(createElement(App));

    assert.match(html, /Private means private/);
    assert.match(html, /Category-by-category control/);
  } finally {
    await vite.close();
    delete globalThis.window;
  }
});
