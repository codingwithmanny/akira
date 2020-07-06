import { Client, Structures } from "discord.js";
import snakeCase from "lodash.snakecase";
import { getRepository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { GuildSettings, IGuildSettings } from "../entity/GuildSettings";
import { MaybeArray } from "../util/utilities";

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

    async set(values: MaybeArray<QueryDeepPartialEntity<GuildSettings>>) {
      const keys = Object.keys(Array.isArray(values) ? values[0] : values);

      values = Array.isArray(values)
        ? values.map((value) => ({ ...value, guildId: this.id }))
        : { ...values, guildId: this.id };

      return getRepository(GuildSettings)
        .createQueryBuilder()
        .insert()
        .orUpdate({
          conflict_target: ["guild_id"],
          overwrite: keys.map(snakeCase),
        })
        .values(values)
        .execute();
    }
  };
});
