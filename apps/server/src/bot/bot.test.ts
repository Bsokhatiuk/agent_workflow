import { describe, expect, it } from "vitest";
import { createFakeBot } from "../../test/fake-bot.ts";
import { buildApp } from "../main.ts";

const startUpdate = {
  update_id: 1,
  message: {
    message_id: 1,
    date: 1_700_000_000,
    chat: { id: 42, type: "private", first_name: "Ann" },
    from: { id: 42, is_bot: false, first_name: "Ann" },
    text: "/start",
    entities: [{ type: "bot_command", offset: 0, length: 6 }],
  },
};

describe("bot webhook", () => {
  it("replies to /start with a button that opens the Mini App", async () => {
    const { bot, calls } = createFakeBot("https://example.test/app");
    const app = buildApp({ bot, botWebhookSecret: "secret" });

    const res = await app.inject({
      method: "POST",
      url: "/bot/webhook",
      headers: { "x-telegram-bot-api-secret-token": "secret" },
      payload: startUpdate,
    });

    expect(res.statusCode).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe("sendMessage");
    expect(calls[0]?.payload).toMatchObject({
      chat_id: 42,
      reply_markup: { inline_keyboard: [[{ text: "Open", web_app: { url: "https://example.test/app" } }]] },
    });
  });

  it("rejects an update without the webhook secret", async () => {
    const { bot, calls } = createFakeBot();
    const app = buildApp({ bot, botWebhookSecret: "secret" });

    const res = await app.inject({ method: "POST", url: "/bot/webhook", payload: startUpdate });

    expect(res.statusCode).toBe(401);
    expect(calls).toHaveLength(0);
  });
});
