import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { BotContext } from './../common/types';
import config from './../../config.json';

export async function moderateUser(
  { repository }: BotContext,
  channel: TextChannel,
  member: GuildMember,
): Promise<void> {
  try {
    const { id, nickname, displayName } = member;
    const { count } = await repository.getWarn(id);
    let name = nickname;

    if (!name) {
      name = displayName;
    }

    if (count >= config.warn.count) {
      if (config.ban) {
        await member.ban({
          reason: 'Repeated NSFW content violation',
        });
      } else {
        await member.kick('Repeated NSFW content violation');
      }

      await channel.send(
        /* eslint-disable max-len */
        `Member \`${name}\` has been ${config.ban ? 'banned' : 'kicked'} due to repeated NSFW violation`,
      );
    } else {
      await repository.addWarn(id);
      const newCount = await repository.getWarn(id);

      const fields = [
        {
          name: 'Member',
          value: member.id,
        },
        {
          name: 'Warn Count',
          value: newCount,
        },
      ];

      const embed = new MessageEmbed({
        author: {
          name: config.name,
          icon_url: config.imageUrl,
        },
        title: '[WARN] Server Member NSFW Warning',
        color: '#FFDE03',
        fields,
        description: count === config.warn.count ? '**⚠️ LAST WARNING ⚠️**' : '',
      });

      await channel.send(embed);
    }

    return;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Insufficient permissions when trying to moderate users.');
    }
  }
}
