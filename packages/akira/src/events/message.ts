import { TextChannel } from "discord.js";
import isPromise from "is-promise";
import { logger } from "../util/logger";
import { commands, Event } from "../util/registerCommandsAndEvents";

export const event: Event<"message"> = {
  run: async (message) => {
    const { author, guild, channel, content, client } = message;

    if (author.bot || !guild?.available || !(channel instanceof TextChannel)) {
      return;
    }

    const clientPerms = channel.permissionsFor(client.user!);

    if (!clientPerms?.has("SEND_MESSAGES")) {
      return;
    }

    const { prefix } = await guild.get(["prefix"]);
    const [commandName, ...args] = content.slice(prefix.length).split(/ +/);
    const command = commands.get(commandName.toLowerCase());

    if (!command) {
      return logger.warn(`${commandName} is not a valid command`);
    }

    if (command.clientPermissions) {
      const missingPerms = clientPerms.missing(command.clientPermissions);

      if (missingPerms.length) {
        return logger.warn(`Client is missing permissions: ${missingPerms}`);
      }
    }

    if (command.userPermissions) {
      const userPerms = channel.permissionsFor(author);
      const missingPerms = userPerms?.missing(command.userPermissions);

      if (missingPerms?.length) {
        return logger.warn(`User is missing permissions: ${missingPerms}`);
      }
    }

    if (command.acceptsArgs) {
      const validatedArgs = isPromise(command.validateArgs)
        ? await command.validateArgs(message, args)
        : command.validateArgs(message, args);

      if (!validatedArgs && command.requiresArgs) {
        return logger.warn(
          `Invalid arguments provided for command ${command.name}`
        );
      }

      return command.execute(message, validatedArgs);
    }

    return command.execute(message, args);
  },
};
