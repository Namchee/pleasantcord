FROM node:lts

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY yarn.lock package.json ./

RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "dev"]
