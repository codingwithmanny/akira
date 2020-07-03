import { Client, Structures } from "discord.js";
import { GuildSettings, IGuildSettings } from "../entity/GuildSettings";

export = Structures.extend("Guild", (Guild) => {
  return class extends Guild {
    constructor(client: Client, data: object) {
      super(client, data);
    }

    async get<T extends (keyof IGuildSettings)[]>(
      keys: T
    ): Promise<Pick<IGuildSettings, T extends (infer U)[] ? U : never>> {
      let guildSettings = await GuildSettings.findOne(this.id, {
        select: [...keys],
      });

      if (!guildSettings) {
        guildSettings = await GuildSettings.create({ guildId: this.id }).save();
      }

      return guildSettings;
    }
  };
});
