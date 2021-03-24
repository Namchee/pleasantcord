// In this file you can configure migrate-mongo

module.exports = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: 'mongodb://localhost:27017',

    // TODO Change this to your database name:
    databaseName: 'pleasantcord',

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
};
