# Pleasantcord

<p align="center">
  <img src="docs/banner.png" title="Pleasantcord" alt="Pleasantcord Banner" />
</p>

<p align="center">
  <a href="http://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" title="TypeScript" alt="Made with TypeScript" />
  </a>
  <a href="https://github.com/google/gts">
    <img src="https://img.shields.io/badge/code%20style-google-blueviolet.svg" title="CodeStyle: Google" alt="GTS Logo" />
  </a>
  <a href="https://discord.com/api/oauth2/authorize?client_id=750668307555942482&permissions=268445718&scope=bot">
    <img src="https://img.shields.io/badge/Discord-Invite-blue" title="Bot Invite Link" alt="Bot Invite Link" />
  </a>
  <a href="https://github.com/Namchee/pleasantcord/issues">
    <img src="https://img.shields.io/github/issues/namchee/pleasantcord" title="Issues" alt="Issues" />
  </a>
  <a href="https://github.com/Namchee/pleasantcord/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/namchee/pleasantcord" title="Issues" alt="Issues" />
  </a>
</p>

Pleasantcord is a simple NSFW image auto moderation bot 🤖 for Discord powered by [TensorFlow JS](https://www.npmjs.com/package/@tensorflow/tfjs-node). On the inside, it uses a pretrained [Inception V3 model](https://keras.io/api/applications/inceptionv3/) provided by [nsfw.js](https://github.com/infinitered/nsfwjs) that is able to distinguish image category to several categories.

## Motivation

Discord has [NSFW Channel System](https://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content). Unfortunately, the system cannot prevent NSFW contents from being posted on SFW channels and content moderation must still be done manually by server administrator.

This bot aims to fix that by automatically detecting potential NSFW images and administer correct response to the posted content either by blurring the image or removing it altogether.

## Installation

> This bot is still on active development. The API **may** break at any moment

Invite this bot to your server by clicking [this link](https://discord.com/api/oauth2/authorize?client_id=750668307555942482&permissions=268445718&scope=bot).

The bot itself requires the following permission in your server, make sure that the bot has **all** the permissions below:

- `Send Messages`
- `Manage Messages`

## Development

TBA
## Commands

Command | Description
------- | -----------
`status` | Show the bot status (ping, environment, etc).
`help` | Show the bot help menu.

## FAQ

### What's the default behavior of `pleasantcord`?

By default, `pleasantcord` will classify any image contents as NSFW when it has `Hentai` or `Porn` label with more than 70% accuracy and delete it from any text channel that isn't configured to be a NSFW channel.
### Can I use a custom moderation configuration for `pleasantcord`?

For now, no you can't. In the future, it will be possible to configure the behavior yourself. Stay tuned!

### The classification is incorrect!

I'm not the one who created the model, so I can't say anything about it. That being said, image classification is an ML algorithm which could produce false alarms from time to time, so false alarms are quite common occurence.

## Credits

- [infinitered](https://github.com/infinitered) — Provides an easy-to-use pretrained model for NSFW detection.
- [Namchee](https://github.com/Namchee/pleasantcord) — (me) For working on the project!
## License

This project is licensed under the [MIT License](LICENSE)
