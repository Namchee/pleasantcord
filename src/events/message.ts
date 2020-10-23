import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { isNSFW } from './../service/nsfw.classifier';
import { fetchImage } from './../service/image.downloader';
import { BotContext } from './../common/types';

export default {
  event: 'message',
  fn: async (_: BotContext, msg: Message): Promise<void> => {
    const { author, attachments, content } = msg;
    const channel = msg.channel as TextChannel;

    if (author.bot || attachments.size === 0 || channel.nsfw) {
      return;
    }

    for (const attachment of attachments) {
      const { url } = attachment[1];

      if (/\.(jpg|png|jpeg)$/.test(url)) {
        const verdict = await isNSFW(url);

        if (!verdict.isSFW) {
          const image = await fetchImage(attachment[1].url);
          const confidence = verdict.confidence as number;

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

          const moderationMessage = channel.send(
            new MessageEmbed({
              author: {
                name: 'pleasantcord',
                icon_url: 'https://images.unsplash.com/photo-1592205644721-2fe5214762ae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=667&q=80',
              },
              title: `Auto moderation message on #${channel.name}`,
              fields,
              description: '**⚠️ Potentially NSFW ⚠️**',
              color: '#E53E3E',
              files: [
                {
                  attachment: image,
                  name: `SPOILER_${attachment[1].name}`,
                },
              ],
            }),
          );

          const del = msg.delete({
            reason: 'Possible NSFW content',
          });

          await Promise.allSettled([moderationMessage, del]);

          return;
        }
      }
    }
  },
};
