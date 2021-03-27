import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { DateTime } from 'luxon';
import { resolve } from 'path';

import { BotContext } from '../bot/types';
import { DBException } from '../exceptions/db';

const config = require(
  resolve(process.cwd(), 'config.json'),
);

export async function moderateUser(
  { repository }: BotContext,
  msg: Message,
  member: GuildMember,
): Promise<void> {
  try {
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

    if (count >= config.warn.count) {
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
  } catch (err) {
    if (err instanceof DBException) {
      console.error(err.message);
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('Insufficient permissions when trying to moderate users.');
    }
  }
}
