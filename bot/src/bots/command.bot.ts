import { ConversationFlavor } from "@grammyjs/conversations";
import { Composer, Context, InlineKeyboard, NextFunction } from "grammy";
import { AuthService } from "../services/auth.service";

interface ICommand {
  command: string;
  description: string;
}

export const commands: ICommand[] = [
  {
    command: "start",
    description: "Start the bot"
  },
  {
    command: "reset",
    description: "Reset the bot"
  }
]

export const commandComposer = new Composer<ConversationFlavor<Context>>();
const authService = new AuthService();
export async function checkBot(ctx: Context, next: NextFunction) {
  try {
    const tgID = ctx.from.id;
    const isValid = await authService.checkBot(tgID);
    if (!isValid) {
      return;
    }
  } catch (error) {
    console.error("Ошибка при проверке бота:", error);
  }
  await next();
}

const commandKeyboard = new InlineKeyboard()
  .text("Задачи", "tasks_start").row()
  .text("Заявки", "applications_start").row()
  .text("Документы", "documents_start").row();

commandComposer.command("start", async (ctx) => {
  await ctx.reply("Добро пожаловать! Выберите действие:", {
    reply_markup: commandKeyboard
  });
});

commandComposer.command("reset", async (ctx) => {
  await ctx.reply("Все действия сброшены. Вы можете начать заново.");
  ctx.conversation.exitAll();
});
