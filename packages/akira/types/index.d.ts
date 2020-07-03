import { InsertResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { GuildSettings, IGuildSettings } from "../src/entity/GuildSettings";
import { MaybeArray } from "../src/util/utilities";

declare module "discord.js" {
  interface Guild {
    get<T extends (keyof IGuildSettings)[]>(
      keys: T
    ): Promise<Pick<IGuildSettings, T extends (infer U)[] ? U : never>>;
    set(
      values: MaybeArray<QueryDeepPartialEntity<GuildSettings>>
    ): Promise<InsertResult>;
  }
}
