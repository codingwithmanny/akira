import { Command } from "../util/registerCommandsAndEvents";

export const command: Command = {
  category: "general",
  description: "Hello world",
  aliases: ["hello"],
  execute: (message) => {
    message.channel.send("Hello world!");
  },
};
