import { Client, ClientEvents } from "discord.js";
import glob from "glob";
import { parse } from "path";
import { promisify } from "util";

export interface Event<T extends keyof ClientEvents> {
  // Can be inferred from filename
  eventName?: T;
  emitOnce?: boolean;
  run(...args: [...ClientEvents[T], Client]): unknown | Promise<unknown>;
}

interface FileImport {
  event: Event<keyof ClientEvents>;
}

const globAsync = promisify(glob);

export const registerEvents = async (eventDir: string) => {
  const events: FileImport["event"][] = [];
  const eventFiles = await globAsync(eventDir);

  for (const eventFile of eventFiles) {
    const { event } = (await import(eventFile)) as FileImport;

    if (!event) {
      throw Error(`${eventFile} is not exporting a object named "event"`);
    }

    const { name: fileName } = parse(eventFile);
    const eventName = (event.eventName as keyof ClientEvents) ?? fileName;

    events.push({ ...event, eventName });
  }

  return events;
};
