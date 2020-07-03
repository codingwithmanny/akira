import { IGuildSettings } from "../src/entity/GuildSettings";

declare module "discord.js" {
  interface Guild {
    get<T extends (keyof IGuildSettings)[]>(
      keys: T
    ): Promise<Pick<IGuildSettings, T extends (infer U)[] ? U : never>>;
  }
}
