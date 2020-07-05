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
  guildId: string;

  @Column({ default: process.env.PREFIX })
  prefix: string;

  @Column({ default: process.env.CLIENT_ID })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
