import { Message, DMChannel, Constants } from 'discord.js';
import { isNSFW } from '@/service/nsfw';

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
          msg.delete({
            reason: 'NSFW image',
          });

          /* eslint-disable */

          const mods = msg.channel.send(
            `Moderation message: ${msg.author} just sent this in the channel`
          );

          const warning = msg.channel.send(
            '**WARNING ⚠️: Contains NSFW image, only click on the spoiler if you know what are you doing**'
          );

          const contents = msg.channel.send(
            msg.content,
            {
              files: [{
                attachment: attachment[1].url,
                name: `SPOILER_${attachment[1].name}`
              }],
            },
          );

          await Promise.allSettled([mods, warning, contents]);

          return;
        }
      }
    }
  },
};
