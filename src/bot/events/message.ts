import {
  GuildMember,
  Message,
  MessageAttachment,
  MessageEmbed,
  TextChannel,
} from 'discord.js';

import { isNSFW } from '../../service/nsfw.classifier';
import { fetchImage } from '../../service/image.downloader';
import { CommandHandler, BotContext } from '../types';
import { errorHandler, getCommands } from '../utils';
import { DateTime } from 'luxon';

const commandMap: Record<string, Function> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

async function moderateMember(
  { config, repository }: BotContext,
  msg: Message,
  member: GuildMember,
): Promise<void> {
  const { guild, createdAt, channel } = msg;
  const { nickname, displayName, id } = member;

  let name = nickname;

  if (!name) {
    name = displayName;
  }

  let count = 0;

  const strike = await repository.getStrike(
    guild?.id as string,
    id,
  );

  if (strike) {
    count = strike.count;
  }

  if (count >= config.strike.count) {
    if (config.ban) {
      await member.ban({
        reason: 'Repeated NSFW content violation',
      });
    } else {
      await member.kick('Repeated NSFW content violation');
    }

    const moderationEmbed = new MessageEmbed({
      author: {
        name: config.name,
        iconURL: config.imageUrl,
      },
      title: `${config.name} Server Moderation`,
      // eslint-disable-next-line max-len
      description: `Member \`${name}\` has been ${config.ban ? 'banned' : 'kicked'} due to repeated NSFW violation`,
      fields: [
        {
          name: 'Reason',
          value: 'Repeated NSFW content violation',
          inline: true,
        },
        {
          name: 'Action',
          value: config.ban ? 'Ban' : 'Kick',
          inline: true,
        },
        {
          name: 'Effective Date',
          value: DateTime.now().toString(),
        },
      ],
    });

    await channel.send(moderationEmbed);
  } else {
    await repository.addStrike(
      guild?.id as string,
      id,
      createdAt,
    );
  }
}

export default {
  event: 'message',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    const { author, attachments, content } = msg;
    const { prefix, deleteNSFW } = ctx.config;

    if (!msg.guild || !msg.channel.isText() || author.bot) {
      return;
    }

    const channel = msg.channel as TextChannel;

    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/ +/);
      const commandHandler = commandMap[args[0]];

      if (commandHandler) {
        return commandHandler(ctx, msg);
      } else {
        return channel.send(
          // eslint-disable-next-line max-len
          `Whoops, I don't recognize that command. Try **${prefix}help**`,
        );
      }
    }

    if (channel.nsfw) {
      return;
    }

    try {
      const { name: botName, imageUrl: botImage } = ctx.config;

      const moderations = attachments.map(
        async ({ url, name }: MessageAttachment) => {
          if (/\.(jpg|png|jpeg)$/.test(url)) {
            const { isSFW, confidence } = await isNSFW(url);

            if (!isSFW) {
              const image = await fetchImage(url);

              const fields = [
                {
                  name: 'Original Author',
                  value: author.toString(),
                  inline: true,
                },
                {
                  name: 'Reason',
                  value: 'Potentially NSFW attachment',
                  inline: true,
                },
                {
                  name: 'Accuracy',
                  value: `${(confidence * 100).toFixed(2)}%`,
                  inline: true,
                },
              ];

              if (content) {
                fields.push(
                  { name: 'Original Content', value: content, inline: false },
                );
              }

              const req = [];

              if (!deleteNSFW) {
                const blurredMessage = channel.send(
                  new MessageEmbed({
                    author: {
                      name: botName,
                      iconURL: botImage,
                    },
                    title: `NSFW Moderation on #${channel.name}`,
                    fields,
                    color: '#E53E3E',
                    files: [
                      {
                        attachment: image,
                        name: `SPOILER_${name}`,
                      },
                    ],
                  }),
                );

                req.push(blurredMessage);
              }

              if (msg.deletable) {
                req.push(
                  msg.delete({
                    reason: 'Possible NSFW content',
                  }),
                );
              }

              await Promise.allSettled(req);

              const member = msg.guild?.member(author);

              if (member) {
                await moderateMember(ctx, msg, member);
              }
            }
          }
        },
      );

      await Promise.allSettled(moderations);
    } catch (err) {
      return channel.send(errorHandler(ctx.config, err));
    }
  },
};
