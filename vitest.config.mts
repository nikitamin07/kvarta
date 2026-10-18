import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    environment: "node",
    // боевая база в тесты не попадает
    env: {
      DATABASE_URL: env.DATABASE_URL_TEST ?? "",
      DATABASE_URL_TEST: env.DATABASE_URL_TEST ?? "",
      TELEGRAM_BOT_TOKEN: "",
      TELEGRAM_CHAT_ID: "",
    },
  },
});
