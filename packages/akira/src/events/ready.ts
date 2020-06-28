import { logger } from "../util/logger";
import { Event } from "../util/registerCommandsAndEvents";

export const event: Event<"ready"> = {
  emitOnce: true,
  run: (client) => logger.info(`${client.user!.username} is ready`),
};
