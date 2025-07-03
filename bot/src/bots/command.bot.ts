import { Composer } from "grammy";

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
