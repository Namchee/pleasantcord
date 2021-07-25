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
</p>

Pleasantcord is a simple NSFW image auto moderation bot 🤖 for Discord powered by [TensorFlow JS](https://www.npmjs.com/package/@tensorflow/tfjs-node). On the inside, it uses a pretrained [Inception V3 model](https://keras.io/api/applications/inceptionv3/) provided by [nsfw.js](https://github.com/infinitered/nsfwjs) that is able to distinguish image category to several categories.

The bot behavior can be controlled from the config file.

> For now, you have to deploy your own version of bot if you want to modify the configuration.

## Installation

> This bot is still on active development.

Invite this bot to your server by clicking this link ***coming soon***.
## Development

### Requirements

1. Docker
2. Node v12 or higher

## Installation

1. Clone the repository
2. Navigate to your freshly cloned git directory
3. Create a new `.env` file in the current directory
4. Fill the new `.env` file with the instructions on `.env.sample` file
5. Execute `docker-compose -f docker-compose.dev.yml up` from your favorite terminal.

## Configuration

Below is the list of possible configuration for the bot:

Key | Description
--- | -----------
`name` | Discord's bot name
`imageUrl` | Image to be shown on rich message embeds. Should be same as the bot display picture from Discord's Developer Portal.
`prefix` | Prefix for various commands for the bot.
`confidence` | Threshold for NSFW content prediction. Any content will be moderated if the NSFW probability is higher than this value.
`deleteNSFW` | Determine if the bot should repost the NSFW content.
`strike.count` | Determine how many times should a member be warned when commiting a NSFW violation before being banned / kicked
`strike.refreshPeriod` | Determine expiration time for member's violation in seconds. Set as `-1` if violation should remain permanent.
`ban` | Determine if excess violators should be banned from the server instead of kicked.

> This bot **DOES NOT** provide an `unban` command. Server admins must unban the members themselves

## Commands

> Must be prefixed with `prefix` from the config.

Command | Description
------- | -----------
`strike` | Count how many NSFW violation by the said member on the current server. Can only be invoked by the said member.
`strikes` | Count how many NSFW violation by all members on the current server.
`status` | Show the bot status (ping, environment, etc).
`help` | Show the bot help menu.

## Motivation

Discord has [NSFW Channel System](https://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content). Unfortunately, it can't prevent NSFW content to be posted
on SFW channels and still requires manual moderation. This bot aims to fix that.

## Credits

- [infinitered](https://github.com/infinitered) — Provides an easy-to-use pretrained model for NSFW detection.
- [Namchee](https://github.com/Namchee/pleasantcord) — For working on the project!
## License

This project is licensed under the [MIT License](LICENSE)
