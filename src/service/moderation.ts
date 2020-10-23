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
    const warningCount = await repository.getWarn(id);
    let name = nickname;

    if (!name) {
      name = displayName;
    }

    if (warningCount >= config.warn.count) {
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
      const warnCount = await repository.getWarn(id);

      const fields = [
        {
          name: 'Member',
          value: member.id,
          inline: true,
        },
        {
          name: 'Warn Count',
          value: warnCount,
          inline: true,
        },
      ];

      const embed = new MessageEmbed({
        author: {
          name: config.name,
          icon_url: config.imageUrl,
        },
        title: '[WARN] Server Member NSFW Warning',
        color: '#E53E3E',
        fields,
        description: warnCount === config.warn.count ? '**⚠️ LAST WARNING ⚠️**' : '',
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
