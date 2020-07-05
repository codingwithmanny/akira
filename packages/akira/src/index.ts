import { Client, Intents } from "discord.js";
import "dotenv/config";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import "./structures/Guild";
import {
  events,
  registerCommandsAndEvents,
} from "./util/registerCommandsAndEvents";

const main = async () => {
  await createConnection({
    ...(await getConnectionOptions(process.env.NODE_ENV)),
    name: "default",
    namingStrategy: new SnakeNamingStrategy(),
  });

  await registerCommandsAndEvents({
    eventDir: `${__dirname}/events/*{.js,.ts}`,
    commandDir: `${__dirname}/commands/**/*{.js,.ts}`,
  });

  const intents = new Intents(Intents.ALL).remove([
    "DIRECT_MESSAGE_TYPING",
    "GUILD_MESSAGE_TYPING",
  ]);
  const client = new Client({
    disableMentions: "all",
    ws: { intents },
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    restRequestTimeout: 60000,
  });

  events.forEach(({ eventName, emitOnce, run }) =>
    client[emitOnce ? "once" : "on"](eventName!, (...args) =>
      run(...args, client)
    )
  );

  client.login(process.env.TOKEN);
};

main();
