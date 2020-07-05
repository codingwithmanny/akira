import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Question } from "./Question";

@Entity()
@Unique("uc_ids", ["userId", "questionMessageId"])
export class Answer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  answerIndex: number;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: "CASCADE",
  })
  question: Question;

  @Column({ readonly: true })
  // @ts-expect-error
  private readonly questionMessageId: string;
}
