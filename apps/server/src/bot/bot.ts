import { Bot, InlineKeyboard } from "grammy";

// The one shared bot: /start answers with a button that opens the Mini App.
export function createBot(token: string, webAppUrl: string): Bot {
  const bot = new Bot(token);
  bot.command("start", (ctx) =>
    ctx.reply("Book a service in the app:", {
      reply_markup: new InlineKeyboard().webApp("Open", webAppUrl),
    }),
  );
  return bot;
}
