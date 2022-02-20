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
  <a href="https://discord.com/api/oauth2/authorize?client_id=750668307555942482&permissions=10240&scope=bot">
    <img src="https://img.shields.io/badge/Discord-Invite-blue" title="Bot Invite Link" alt="Bot Invite Link" />
  </a>
  <a href="https://discord.gg/Pj4aGp8Aky">
    <img src="https://img.shields.io/badge/Support%20Server-Invite%20Link-blue?logo=discord" title="Support Server Link" alt="Support Server Link" />
  </a>
  <a href="https://github.com/Namchee/pleasantcord/issues">
    <img src="https://img.shields.io/github/issues/namchee/pleasantcord" title="Issues" alt="Issues" />
  </a>
  <a href="https://github.com/Namchee/pleasantcord/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/namchee/pleasantcord" title="License" alt="License" />
  </a>
</p>

Pleasantcord is a simple NSFW image auto moderation bot 🤖 for Discord powered by [TensorFlow JS](https://www.npmjs.com/package/@tensorflow/tfjs-node). On the inside, it uses a pretrained [Inception V3 model](https://keras.io/api/applications/inceptionv3/) provided by [nsfw.js](https://github.com/infinitered/nsfwjs) that is able to distinguish image category to several categories.

<p align="center">
  <img src="./docs/demo.gif" />
</p>

> This is just a demo. Of course Pleasantcord won't remove Cuphead images!

## Motivation

Discord has [NSFW Channel System](https://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content). Unfortunately, the system cannot prevent NSFW contents from being posted on SFW channels and content moderation must still be done manually by server administrator.

This bot aims to fix that by automatically detecting potential NSFW images and administer correct response to the posted content either by blurring the image (coming soon!) or removing it altogether.

## Installation

Invite this bot to your server by clicking [this link](https://discord.com/api/oauth2/authorize?client_id=750668307555942482&permissions=10240&scope=applications.commands%20bot).

The bot itself requires the following permission in your server, make sure that the bot has **all** the permissions below:

- `Send Messages`
- `Manage Messages`

Besides the above permissions, make sure that `pleasantcord` is able to view and access your channels.

Failed to comply with those requirements may result `pleasantcord` to throw `Missing permissions` or `Missing Access`.

## Commands

All commands are prefixed with `pc!`

Command | Description
------- | -----------
`status` | Show the bot status (ping, environment, etc).
`help` | Show the bot help menu.

## FAQ

### What's the default behavior of `pleasantcord`?

By default, `pleasantcord` will classify any image contents as NSFW when it has `Hentai` or `Porn` label with more than 75% accuracy and delete it from any **text channel** that isn't configured to be a NSFW channel.

### The GIF classification is so slow!

We are aware of this issue. We are looking to enhance the performance in future release.

### Animated `webp` and `png` throw errors!

Discord cannot display them correctly, yet there's no way to distinguish them from normal non-animated one as they share the same header.

### The classification is incorrect!

I'm not the one who created the model, so I can't say anything about it. That being said, image classification is an ML algorithm which could produce false alarms from time to time, so false alarms are quite common occurence.

## Data Privacy

Technically, `pleasantcord` won't store any of your data. However when `pleasantcord` has encountered an error on your server, `pleasantcord` will store the stacktrace on the logging system which *may* include your personal data (which is 100% embeddable content). This is done to ensure easier error debugging and fixing.

When the issue has been detected, acknowledged, and analyzed, your personal data will **immediately** deleted. If you feel that your data is still stored on our system, feel free to [join our support server](https://discord.gg/Pj4aGp8Aky) and contact the moderators directly.

## Credits

- [infinitered](https://github.com/infinitered) — Provides an easy-to-use pretrained model for NSFW detection.
- [Namchee](https://github.com/Namchee/pleasantcord) — (me) For working on the project!
## License

This project is licensed under the [MIT License](LICENSE)
