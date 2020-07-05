import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { numericEmojis } from "../util/utilities";
import { Answer } from "./Answer";

@Entity()
export class Question extends BaseEntity {
  @PrimaryColumn()
  messageId: string;

  @Column()
  authorId: string;

  @Column()
  question: string;

  @Column("varchar", { array: true })
  possibleAnswers: string[];

  @Column()
  isAnonymous: boolean;

  @OneToMany(() => Answer, (answer) => answer.question, { eager: true })
  answers: Answer[];

  get formattedAnswers() {
    return this.possibleAnswers
      .map((answer, idx) => `${numericEmojis[idx]}: **${answer}**`)
      .join("\n");
  }
}
