import { Composer } from "grammy";

export const requestsComposer = new Composer();


requestsComposer.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;

  switch (data) {
    case "requests_start":

      break;
    case "get_requests":

      break;
    case "search_by_id":

      break;
    case "search_by_status":
      break;
    case "main_menu":
      await ctx.reply("Вы вернулись в главное меню.");
      break;
    default:
      await ctx.reply("Неизвестная команда.");
  }
  await next();
});