import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export interface IGuildSettings {
  guildId: string;
  prefix: string;
  updatedBy: string;
  updatedAt: Date;
}

@Entity()
export class GuildSettings extends BaseEntity implements IGuildSettings {
  @PrimaryColumn()
  guildId!: string;

  @Column({
    comment: "The prefix of the guild to trigger the bot (e.g., !, a!, $)",
    default: process.env.PREFIX,
  })
  prefix!: string;

  @Column({
    comment:
      "The id of the user who was the last one to update the guild settings",
    default: process.env.CLIENT_ID,
  })
  updatedBy!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
