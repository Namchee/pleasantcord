// @ts-check

const { resolve } = require('path');
const { strike } = require(
  resolve(process.cwd(), 'config.json'),
);

const now = new Date().getTime();

module.exports = {
  async up(db, client) {
    await db.collection('strikes')
      .updateMany(
        {},
        {
          $set: {
            deleted: { $lte: new Date(now - strike.refreshPeriod) },
          },
        },
      );
  },

  async down(db, client) {
    await db.collection('strikes')
      .updateMany(
        {},
        { $unset: { deleted: 1 } },
      );
  },
};
