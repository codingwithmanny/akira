import { Client, Structures } from "discord.js";
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

      if (!keys.length) {
        throw new Error("Cannot upsert without any values specified");
      }

      values = Array.isArray(values)
        ? values.map((value) => ({ ...value, guildId: this.id }))
        : { ...values, guildId: this.id };

      const updateStr = keys
        .map((key) => `"${key}" = EXCLUDED."${key}"`)
        .join(", ");

      return getRepository(GuildSettings)
        .createQueryBuilder()
        .insert()
        .values(values)
        .onConflict(`("guildId") DO UPDATE SET ${updateStr}`)
        .execute();
    }
  };
});
