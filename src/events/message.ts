import { Message } from 'discord.js';

export default {
  event: 'message',
  fn: async (msg: Message): Promise<Message | void> => {
    if (msg.author.bot ||
      msg.attachments.size === 0) {
      return;
    }

    for (const attachment of msg.attachments) {
      if (/\.(jpg|png|jpeg)$/.test(attachment[1].url)) {
        console.log('gambar');
      }
    }
  },
};
