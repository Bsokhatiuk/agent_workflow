import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import { type Bot, webhookCallback } from "grammy";
import { createBot } from "./bot/bot.ts";
import { loadConfig } from "./shared/config.ts";
import { registerErrorHandler } from "./shared/errors.ts";

export interface AppOptions {
  bot: Bot;
  botWebhookSecret: string;
  webDistDir?: string | undefined;
  logger?: boolean;
}

// Composition root: every module's routes plugin is registered here.
export function buildApp(opts: AppOptions): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? false });
  registerErrorHandler(app);

  app.get("/health", async () => ({ status: "ok" }));
  app.post("/bot/webhook", webhookCallback(opts.bot, "fastify", { secretToken: opts.botWebhookSecret }));

  if (opts.webDistDir) {
    app.register(fastifyStatic, { root: opts.webDistDir });
  }
  return app;
}

if (import.meta.main) {
  const config = loadConfig();
  const app = buildApp({
    bot: createBot(config.BOT_TOKEN, config.WEBAPP_URL),
    botWebhookSecret: config.BOT_WEBHOOK_SECRET,
    webDistDir: config.WEB_DIST_DIR,
    logger: true,
  });
  await app.listen({ host: "0.0.0.0", port: config.PORT });
}
