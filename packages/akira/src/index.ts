import { Client, Intents } from "discord.js";
import "dotenv/config";
import {
  events,
  registerCommandsAndEvents,
} from "./util/registerCommandsAndEvents";

const main = async () => {
  const intents = new Intents(Intents.ALL).remove([
    "DIRECT_MESSAGE_TYPING",
    "GUILD_MESSAGE_TYPING",
  ]);
  const client = new Client({ disableMentions: "everyone", ws: { intents } });

  await registerCommandsAndEvents({
    commandDir: `${__dirname}/commands/*{.js,.ts}`,
    eventDir: `${__dirname}/events/*{.js,.ts}`,
  });

  events.forEach(({ eventName, emitOnce, run }) =>
    client[emitOnce ? "once" : "on"](eventName!, (...args) =>
      run(...args, client)
    )
  );

  client.login(process.env.TOKEN);
};

main();
