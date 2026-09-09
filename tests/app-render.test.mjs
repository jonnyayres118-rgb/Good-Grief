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
    assert.match(html, /Draft the whole plan for free/);
    assert.match(html, /three trusted people/);
  } finally {
    await vite.close();
    delete globalThis.window;
  }
});
test("the unpaid planner offers to secure a device-saved draft", async () => {
  globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  globalThis.window = {
    location: { pathname: "/planner", search: "", hash: "", origin: "https://example.test" },
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
    assert.match(html, /Secure my plan/);
    assert.match(html, /Saved on this device/);
  } finally {
    await vite.close();
    delete globalThis.localStorage;
    delete globalThis.window;
  }
});
