import { Composer, InlineKeyboard } from "grammy";
import { AuthService } from "../services/auth.service";
import { UserComposerConversation } from "../commons/context.types";

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

export const commandComposer = new Composer<UserComposerConversation>();
const authService = new AuthService();

commandComposer.use(async (ctx, next) => {
  if (!ctx.session.user) {
    try {
      const result = await checkBot(ctx.from.id);
      ctx.session.user = result.user;
    } catch (error) {
      ctx.reply("Вы не зарегистрированы в системе. Пожалуйста, обратитесь к администратору.");
      return;
    }
  }
  await next();
})

async function checkBot(tgID: number) {
  try {
    const isValid = await authService.checkBot(tgID);
    return isValid;
  } catch (error) {
    console.error("Ошибка при проверке бота:", error);
  }
  return;
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
