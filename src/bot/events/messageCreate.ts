import {
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { NSFWJS } from 'nsfwjs';
import { performance } from 'perf_hooks';
import { FunctionThread } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';

import { ATTACHMENT_CONTENT_TYPE } from '../../constants/content';
import { BASE_CONFIG } from '../../entity/config';
import { Category, Content } from '../../entity/content';
import { Logger } from '../../utils/logger';
import { CommandHandler, BotContext, CommandHandlerFunction } from '../types';
import { handleError, getCommands } from '../utils';

/**
 * Get all available commands from command files and
 * register all commands to a simple object map.
 */
const commandMap: Record<string, CommandHandlerFunction> = {};
const commandHandlers = getCommands();

commandHandlers.forEach((handler: CommandHandler) => {
  commandMap[handler.command] = handler.fn;
});

/**
 * Check all supported content for NSFW contents
 * and react accordingly.
 *
 * @param {BotContext} ctx bot context
 * @param {Message} msg discord's message object
 * @returns {Promise<void>}
 */
async function moderateContent(
  { model, service, rateLimiter, workers }: BotContext,
  msg: Message,
): Promise<void> {
  const channel = msg.channel as TextChannel;

  if (channel.nsfw) {
    return;
  }

  const contents: Content[] = [];
  msg.attachments.forEach(({ url, name, contentType }) => {
    if (!!contentType && ATTACHMENT_CONTENT_TYPE.includes(contentType)) {
      contents.push({
        type: contentType === 'image/gif' ? 'gif' : 'image',
        name: name || 'nsfw-attachment',
        url,
      });
    }
  });
  // for unexplained reason, `type` is deprecated although it isn't
  msg.embeds.forEach(({ type, url, image, video, thumbnail }) => {
    switch (type) {
      case 'image': {
        contents.push({
          type: 'image',
          name: 'nsfw-embed',
          url: url as string,
        });

        break;
      }
      case 'gifv': {
        contents.push({
          type: 'gif',
          name: 'nsfw-embed',
          url: url as string,
        });

        break;
      }
      case 'rich': {
        if (image) {
          contents.push({
            type: 'image',
            name: 'nsfw-embed',
            url: image.url,
          });

          break;
        }

        if (video && thumbnail) {
          contents.push({
            type: 'image',
            name: 'nsfw-embed',
            url: thumbnail.url,
          });

          break;
        }
      }
    }
  });

  if (contents.length === 0) {
    return;
  }

  const rateLimitKey = `${msg.guildId as string}:${msg.channelId}`;

  if (rateLimiter.isRateLimited(rateLimitKey)) {
    return;
  }

  rateLimiter.rateLimit(rateLimitKey);

  let config = BASE_CONFIG;

  const realConfig = await service.getConfig(msg.guildId as string);

  if (realConfig) {
    config = realConfig;
  } else {
    Logger.getInstance().logBot(
      new Error(`Failed to get configuration for server ${msg.guildId}}`),
    );
  }

  const tasks: QueuedTask<
    FunctionThread<[NSFWJS, string, 'gif' | 'image'], Category[]>,
    Category[]
   >[] = [];

  const start = 0;

  contents.forEach((content) => {
    const task = workers.queue(c => c(model, content.url, content.type));
    tasks.push(task);
  });

  const foo = await Promise.all(tasks);

  console.log(foo[0]);

  let isDeleted = false;

  for await (const result of tasks) {
    console.log('here');
    const isNSFW = result.some((cat) => {
      return config.categories.includes(cat.name) &&
        cat.accuracy >= config.accuracy;
    });

    if (isNSFW && !isDeleted) {
      // make sure that all queued tasks are killed
      tasks.forEach(t => t.cancel());

      const category = result.find(
        cat => config.categories.includes(cat.name),
      ) as Category;

      const fields = [
        {
          name: 'Author',
          value: msg.author.toString(),
        },
        {
          name: 'Category',
          value: category.name,
          inline: true,
        },
        {
          name: 'Accuracy',
          value: `${(category.accuracy * 100).toFixed(2)}%`,
          inline: true,
        },
      ];

      if (msg.content) {
        fields.push(
          { name: 'Contents', value: msg.content, inline: false },
        );
      }

      const promises = [];

      const embed = new MessageEmbed({
        author: {
          name: 'pleasantcord',
          iconURL: process.env.IMAGE_URL,
        },
        title: 'Possible NSFW Contents Detected',
        fields,
        color: process.env.NODE_ENV === 'development' ?
          '#2674C2' :
          '#FF9B05',
      });

      promises.push(channel.send({ embeds: [embed] }));

      // const files = [];

      if (!config.delete) {
        /*
        files.push({
          attachment: '',
          name: `SPOILER_${name}`,
        });

        promises.push(
          channel.send({ files }),
        );
        */
      }

      if (msg.deletable && !msg.deleted) {
        promises.push(msg.delete());
        isDeleted = true;
      }

      if (process.env.NODE_ENV === 'development') {
        const devEmbed = new MessageEmbed({
          author: {
            name: 'pleasantcord',
            iconURL: process.env.IMAGE_URL,
          },
          title: '[DEV] Image Labels',
          fields: [
            {
              name: 'Labels',
              value: result.map(({ name, accuracy }) => {
                return `${name} — ${(accuracy * 100).toFixed(2)}%`;
              }).join('\n'),
            },
            {
              name: 'Elapsed Time',
              value: `${(performance.now() - start).toFixed(2)} ms`,
            },
          ],
          color: '#2674C2',
        });

        promises.push(channel.send({ embeds: [devEmbed] }));
      }

      await Promise.all(promises);

      return;
    }
  }

  /*
  const moderations: Promise<Message[] | Message>[] = contents.map(
    async ({ type, name, url }: Content) => {
      const request = [];

      let start = 0;
      if (process.env.NODE_ENV === 'development') {
        start = performance.now();
      }

      const content = await fetchContent(url);
      const classification = type === 'gif' ?
        await classifier.classifyGif(content) :
        await classifier.classifyImage(content);

      const isNSFW = classification.some((cat) => {
        return config.categories.includes(cat.name) &&
          cat.accuracy >= config.accuracy;
      });

      if (isNSFW) {
        const category = classification.find(
          cat => config.categories.includes(cat.name),
        ) as Category;

        const fields = [
          {
            name: 'Author',
            value: msg.author.toString(),
          },
          {
            name: 'Category',
            value: category.name,
            inline: true,
          },
          {
            name: 'Accuracy',
            value: `${(category.accuracy * 100).toFixed(2)}%`,
            inline: true,
          },
        ];

        if (msg.content) {
          fields.push(
            { name: 'Contents', value: msg.content, inline: false },
          );
        }

        const embed = new MessageEmbed({
          author: {
            name: 'pleasantcord',
            iconURL: process.env.IMAGE_URL,
          },
          title: 'Possible NSFW Contents Detected',
          fields,
          color: process.env.NODE_ENV === 'development' ?
            '#2674C2' :
            '#FF9B05',
        });

        const files = [];

        if (!config.delete) {
          files.push({
            attachment: content,
            name: `SPOILER_${name}`,
          });
        }

        request.push(
          channel.send({ embeds: [embed], files }),
        );

        if (msg.deletable && !msg.deleted) {
          request.push(msg.delete());
        }
      }

      if (process.env.NODE_ENV === 'development') {
        const devEmbed = new MessageEmbed({
          author: {
            name: 'pleasantcord',
            iconURL: process.env.IMAGE_URL,
          },
          title: '[DEV] Image Labels',
          fields: [
            {
              name: 'Labels',
              value: classification.map(({ name, accuracy }) => {
                return `${name} — ${(accuracy * 100).toFixed(2)}%`;
              }).join('\n'),
            },
            {
              name: 'Elapsed Time',
              value: `${(performance.now() - start).toFixed(2)} ms`,
            },
          ],
          color: '#2674C2',
        });

        request.push(channel.send({ embeds: [devEmbed] }));
      }

      return Promise.all(request);
    });

  await Promise.all(moderations);
  */
}

export default {
  event: 'messageCreate',
  fn: async (ctx: BotContext, msg: Message): Promise<Message | void> => {
    try {
      const prefix = 'pc!';

      if (!msg.guild || !msg.channel.isText() || msg.author.bot) {
        return;
      }

      if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const commandHandler = commandMap[args[0]];

        if (commandHandler) {
          await commandHandler(ctx, msg);
        } else {
          const unknownEmbed = new MessageEmbed({
            author: {
              name: 'pleasantcord',
              iconURL: process.env.IMAGE_URL,
            },
            color: '#E53E3E',
            title: 'Unknown Command',
            description:
              // eslint-disable-next-line max-len
              `**pleasantcord** doesn't recognize the command that have been just sent.\nPlease refer to **${prefix}help** to show all available **pleasantcords's** commands.`,
          });

          await msg.channel.send({ embeds: [unknownEmbed] });
        }

        return;
      }

      await moderateContent(ctx, msg);
    } catch (err) {
      const errorEmbed = handleError(err as Error);

      if (errorEmbed) {
        msg.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};
