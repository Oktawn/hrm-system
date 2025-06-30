
interface ICommand {
  command: string;
  description: string;
}

export const commands: ICommand[] = [
  {
    command: "start",
    description: "Start the bot"
  },
]