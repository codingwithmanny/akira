import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Answer } from "./Answer";

@Entity()
export class Question extends BaseEntity {
  @PrimaryColumn()
  messageId!: string;

  @Column()
  authorId!: string;

  @Column()
  question!: string;

  @Column("varchar", { array: true })
  possibleAnswers!: string[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers!: Answer[];
}
