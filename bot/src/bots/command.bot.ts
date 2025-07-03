import { ConversationFlavor } from "@grammyjs/conversations";
import { Composer, Context } from "grammy";

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


commandComposer.command("reset", async (ctx) => {
  await ctx.reply("Все действия сброшены. Вы можете начать заново.");
  ctx.conversation.exitAll();
});
