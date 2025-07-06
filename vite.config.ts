import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "jsdom",
  },
  define: {
    // Define global constants for the browser environment
    global: "globalThis",
  },
});
