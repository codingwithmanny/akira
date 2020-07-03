import { Command } from "../../util/registerCommandsAndEvents";

export const command: Command<[string?]> = {
  description: "Get or change the current prefix",
  usage: "<new prefix?>",
  examples: ["-", "/", "$"],
  argsRequired: false,
  userPermissions: ["MANAGE_GUILD"],
  validateArgs: (_, args) => [args[0]],
  async execute(message, [newPrefix]) {
    const { prefix } = await message.guild!.get(["prefix"]);

    if (!newPrefix) {
      return message.channel.send(`The current prefix is ${prefix}`);
    }

    if (newPrefix === prefix) {
      return message.channel.send(
        "You attempted to set the prefix to what it already was"
      );
    }

    await message.guild!.set({
      prefix: newPrefix,
      updatedBy: message.author.id,
    });

    if (newPrefix === process.env.PREFIX) {
      return message.channel.send(
        `The prefix was reset to ${process.env.PREFIX}`
      );
    }

    return message.channel.send(
      `Successfully changed the prefix to ${newPrefix}`
    );
  },
};
