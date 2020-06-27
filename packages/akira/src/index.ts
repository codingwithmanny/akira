import { Client, Intents } from "discord.js";
import "dotenv/config";

const intents = new Intents(Intents.ALL).remove([
  "DIRECT_MESSAGE_TYPING",
  "GUILD_MESSAGE_TYPING",
]);
const client = new Client({ disableMentions: "everyone", ws: { intents } });

client.once("ready", () => console.log(`${client.user?.username} is ready`));

client.login(process.env.TOKEN);
