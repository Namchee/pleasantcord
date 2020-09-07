import { Message } from 'discord.js';
import { isNSFW } from '@/service/nsfw.classifier';
import { fetchImage } from '@/service/image.downloader';

export default {
  event: 'message',
  fn: async (msg: Message): Promise<void> => {
    if (msg.author.bot ||
      msg.attachments.size === 0) {
      return;
    }

    for (const attachment of msg.attachments) {
      const { url } = attachment[1];

      if (/\.(jpg|png|jpeg)$/.test(url)) {
        const { isSFW } = await isNSFW(url);

        if (!isSFW) {
          /* eslint-disable */

          const image = await fetchImage(attachment[1].url);

          const moderation = msg.channel.send(
            '_The following is an auto moderation message by `pleasantcord`. Attachment is possibly a NSFW content._',
          );

          const warning = msg.channel.send(
            '**WARNING ⚠️: Only click the attachment if you know what are you doing!**',
          );

          const originalMessage = msg.channel.send(
            `Sent by ${msg.author}: ${msg.content}`,
            {
              files: [{
                attachment: image,
                name: `SPOILER_${attachment[1].name}`,
              }]
            },
          );

          const del = msg.delete({
            reason: 'Possible NSFW content',
          });

          /* eslint-enable */

          await Promise.all([moderation, warning, originalMessage, del]);

          return;
        }
      }
    }
  },
};
