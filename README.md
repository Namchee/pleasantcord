# Pleasantcord

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

Pleasantcord is a simple NSFW image moderation bot 🤖 for Discord.

![Pleasantcord Demo](docs/demo-pleasantcord.png)

It uses [Clarifai](https://www.clarifai.com/) to classify any message attachments sent on a server. Once the attachment is classified as a possible NSFW content, Pleasantcord will delete the original message and repost it with a warning and spoiler tag.

Currently, it only has minimal features. Probably will be developed further in the future.

## Requirements

1. NodeJS Version 10.x or above
2. [Clarifai](https://www.clarifai.com/) Account (possibly changed)
3. Discord Developer Account

## Installation

> Currently, you **MUST** self-host this bot yourself

1. Clone the repository
2. Navigate to your freshly cloned git directory
3. Execute `npm install` from your terminal
4. Create a new `.env` on the root folder and fill it according to [the sample file](.env.sample)
5. Build the bot by executing `npm run build` in your terminal
6. Run the bot by executing:
    1. Production Mode: `npm run start` from your terminal
    2. Development Mode: `npm run dev` from your terminal. You can skip step 5 by doing this.

## Configuration

NSFW probability limit can be configured in `src/config/api.ts`. The default value is 0.85 [per Clarifai's suggestion](https://www.clarifai.com/models/nsfw-image-recognition-model-e9576d86d2004ed1a38ba0cf39ecb4b1), however you can customize it as you wish.

Example:

```js
export default {
  // ...
  confidence: 0.50, // If Clarifai has 50% or better confidence that it's a NSFW image, it will be moderated
};
```

## Motivation

Discord has [NSFW Channel System](https://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content). Unfortunately, it can't prevent NSFW content to be posted
on SFW channels and still requires manual moderation. This bot aims to fix that.

## License

This project is licensed under [MIT License](LICENSE)
