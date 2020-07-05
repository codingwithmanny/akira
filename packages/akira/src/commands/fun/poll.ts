import { Message, MessageEmbedOptions } from "discord.js";
import { Question } from "../../entity/Question";
import { Command } from "../../util/registerCommandsAndEvents";
import { numericEmojis } from "../../util/utilities";

export const anonymousPollPhrase =
  "*This poll is anonymous, your answer will be hidden\nbut may be changed at any time*";

export const command: Command<string[]> = {
  description: "Start a public or anonymous poll",
  usage: "<question, answers separated by |>",
  examples: ["What is the best looking color? | Red | Green | Blue"],
  acceptsArgs: true,
  requiresArgs: true,
  clientPermissions: [
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "READ_MESSAGE_HISTORY",
    "ADD_REACTIONS",
  ],
  userPermissions: ["EMBED_LINKS", "ADD_REACTIONS"],
  validateArgs: (_, args) => args.join(" ").split(" | "),
  async execute(message, [question, ...answers]) {
    if (answers.length < 2 || answers.length > 10) {
      return message.reply(
        "please provide at least 2 possible answers with a maximum of 10"
      );
    }

    const prompt = await message.channel.send(
      "Do you want this poll to be anonymous? (Y/N)"
    );

    const filter = (message: Message) => {
      return ["y", "n"].includes(message.content.toLowerCase());
    };

    const reply = await message.channel
      .awaitMessages(filter, { max: 1, time: 60000 })
      .then((response) => response.first());

    await prompt.delete();

    if (!reply) {
      return message.reply(
        "poll command will be cancelled because you waited too long"
      );
    }

    const embed: MessageEmbedOptions = {
      color: "BLUE",
      author: {
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
      },
      title: question,
      description: answers
        .map((answer, idx) => `${numericEmojis[idx]}: **${answer}**`)
        .join("\n"),
      footer: {
        text: "The creator of this poll can end this poll by reacting with ✅",
      },
    };

    const pollMessage = await message.channel.send({ embed });

    for (const [idx] of answers.entries()) {
      await pollMessage.react(numericEmojis[idx]);
    }

    await pollMessage.react("✅");

    await message.delete();

    await reply.delete();

    embed.description = `${embed.description}\n\n${anonymousPollPhrase}`;

    await pollMessage.edit({ embed });

    return Question.insert({
      messageId: pollMessage.id,
      authorId: message.author.id,
      question,
      possibleAnswers: answers,
      isAnonymous: reply.content.toLowerCase() === "y",
    });
  },
};
