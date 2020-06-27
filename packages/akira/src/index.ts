import { Client, Intents } from "discord.js";
import "dotenv/config";
import { registerEvents } from "./util/registerEvents";

const main = async () => {
  const intents = new Intents(Intents.ALL).remove([
    "DIRECT_MESSAGE_TYPING",
    "GUILD_MESSAGE_TYPING",
  ]);
  const client = new Client({ disableMentions: "everyone", ws: { intents } });
  const events = await registerEvents(`${__dirname}/events/*{.js,.ts}`);

  events.forEach(({ eventName, emitOnce, run }) =>
    client[emitOnce ? "once" : "on"](eventName!, (...args) =>
      run(...args, client)
    )
  );

  client.login(process.env.TOKEN);
};

main();
