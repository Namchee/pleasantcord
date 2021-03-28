FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "dev"]
