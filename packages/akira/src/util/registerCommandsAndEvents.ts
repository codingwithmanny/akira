import {
  Client,
  ClientEvents,
  Message,
  PermissionResolvable,
} from "discord.js";
import glob from "glob";
import { parse, sep } from "path";
import { promisify } from "util";
import { logger } from "./logger";

type MaybePromise<T> = T | Promise<T>;

type CommandWithArgsProps<T> = {
  argsRequired: boolean;
  usage: string;
  examples?: string[];
  validateArgs(message: Message, args: string[]): MaybePromise<T | undefined>;
};

export type Command<T = void> = {
  // Can be inferred from filename
  name?: string;
  // Can be inferred from foldername
  category?: string;
  description: string;
  aliases?: string[];
  clientPermissions?: PermissionResolvable[];
  userPermissions?: PermissionResolvable[];
  execute(message: Message, args: T): MaybePromise<unknown>;
} & (T extends void ? {} : CommandWithArgsProps<T>);

export interface Event<T extends keyof ClientEvents> {
  // Can be inferred from filename
  eventName?: T;
  emitOnce?: boolean;
  run(...args: [...ClientEvents[T], Client]): MaybePromise<unknown>;
}

interface Directories {
  commandDir: string;
  eventDir: string;
}

interface Module {
  command: Command<unknown>;
  event: Event<keyof ClientEvents>;
}

const globAsync = promisify(glob);

export const events: Array<Module["event"]> = [];

export const commands = new Map<string, Module["command"]>();

export const registerCommandsAndEvents = async ({
  commandDir,
  eventDir,
}: Directories) => {
  const commandFiles = await globAsync(commandDir);
  const eventFiles = await globAsync(eventDir);

  for (const file of [...commandFiles, ...eventFiles]) {
    const { command, event } = (await import(file)) as Module;

    if (!command && !event) {
      throw Error(
        `${file} is not exporting a object named "command" or "event"`
      );
    }

    const { name: fileName, dir } = parse(file);

    if (event) {
      const eventName = (event.eventName as keyof ClientEvents) ?? fileName;

      events.push({ ...event, eventName });

      logger.info(`Successfully loaded event: ${eventName}`);
    } else if (command) {
      const name = command.name ?? fileName;
      const category = dir.split(sep).pop();
      const commandRef = { ...command, name, category };

      commands.set(name, commandRef);

      command.aliases?.forEach((alias) => commands.set(alias, commandRef));

      logger.info(`Successfully loaded command: ${name}`);
    }
  }
};
