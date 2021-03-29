// In this file you can configure migrate-mongo
const { config } = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  config();
}

const { env } = process;

module.exports = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}`,

    databaseName: process.env.MONGO_DBNAME,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true,
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
};
