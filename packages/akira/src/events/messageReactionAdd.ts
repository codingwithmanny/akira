import { MessageEmbed } from "discord.js";
import { getRepository } from "typeorm";
import { anonymousPollPhrase } from "../commands/fun/poll";
import { Answer } from "../entity/Answer";
import { Question } from "../entity/Question";
import { Event } from "../util/registerCommandsAndEvents";
import { numericEmojis } from "../util/utilities";

export const event: Event<"messageReactionAdd"> = {
  run: async (reaction, user) => {
    if (user.bot) {
      return;
    }

    if (reaction.partial) {
      await reaction.fetch();
    }

    // Extends commands/fun/poll.ts
    const numericEmojiIdx = numericEmojis.indexOf(reaction.emoji.name);
    const [embed] = reaction.message.embeds as [MessageEmbed?];

    if (numericEmojiIdx >= 0 && embed?.footer?.text?.includes("poll")) {
      const question = await Question.findOne(reaction.message.id);

      if (question) {
        await getRepository(Answer)
          .createQueryBuilder()
          .insert()
          .orUpdate({
            conflict_target: "uc_ids",
            overwrite: ["answer_index"],
          })
          .values({
            userId: user.id,
            answerIndex: numericEmojiIdx,
            question,
          })
          .execute();

        if (question.isAnonymous) {
          await reaction.users.remove(user.id);
          const count = await Answer.count({ where: { question } });
          const voteCountPhrase = `🗳 **Total votes:** \`${count}\``;

          embed.setDescription(
            `${question.formattedAnswers}\n\n${voteCountPhrase}\n${anonymousPollPhrase}`
          );

          await reaction.message.edit(embed);
        } else {
          const prevReaction = reaction.message.reactions.cache.find(
            (messageReaction) =>
              messageReaction.users.cache.has(user.id) &&
              messageReaction.emoji.name !== reaction.emoji.name
          );

          if (prevReaction) {
            await prevReaction.users.remove(user.id);
          }
        }
      }
    }

    if (reaction.emoji.name === "✅" && embed?.footer?.text?.includes("poll")) {
      await reaction.users.remove(user.id);

      const question = await Question.findOne(reaction.message.id);

      if (question && question.authorId === user.id) {
        const results = numericEmojis
          .filter((emoji) => reaction.message.reactions.cache.has(emoji))
          .map((_, idx) => {
            const answers = question.answers.filter(
              (answer) => answer.answerIndex === idx
            );

            return `**${question.possibleAnswers[idx]}**: \`${answers.length}\` vote(s)`;
          });

        await reaction.message.reactions.removeAll();

        embed.setDescription(results.join("\n"));
        embed.setFooter("This poll has ended, thank you for participating!");

        await reaction.message.edit(embed);

        await Question.delete({ messageId: question.messageId });
      }
    }
    // End
  },
};
