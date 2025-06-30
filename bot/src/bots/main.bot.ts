import { Bot, GrammyError, HttpError } from "grammy";
import { envConfig } from "../config/config";
import { commands } from "./command.bot";

const bot = new Bot(envConfig.get("BOT_TOKEN"));

bot.api.setMyCommands(commands, {
  scope: {
    type: "all_private_chats"
  }
});


bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`); const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});


export default bot;