import type { Bot } from "grammy";
import { createBot } from "../src/bot/bot.ts";

export interface ApiCall {
  method: string;
  payload: Record<string, unknown>;
}

// A bot that never talks to Telegram: getMe is pre-filled, every API call is recorded.
export function createFakeBot(webAppUrl = "https://example.test/app"): { bot: Bot; calls: ApiCall[] } {
  const bot = createBot("123456:fake-token", webAppUrl);
  bot.botInfo = {
    id: 123456,
    is_bot: true,
    first_name: "Test Bot",
    username: "test_bot",
    can_join_groups: false,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: false,
    has_topics_enabled: false,
    allows_users_to_create_topics: false,
    can_manage_bots: false,
    supports_join_request_queries: false,
  };
  const calls: ApiCall[] = [];
  bot.api.config.use(async (_prev, method, payload) => {
    calls.push({ method, payload: payload as Record<string, unknown> });
    return { ok: true, result: true } as never;
  });
  return { bot, calls };
}
