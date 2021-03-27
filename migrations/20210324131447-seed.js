// @ts-check

module.exports = {
  async up(db, client) {
    await db.createCollection('strikes', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['server_id', 'user_id', 'strike_count', 'last_strike'],
          properties: {
            server_id: {
              bsonType: 'string',
              description: 'Discord server ID',
            },
            user_id: {
              bsonType: 'string',
              description: 'Server member ID',
            },
            strike_count: {
              bsonType: 'int',
              description: 'How many strikes in the current cycle',
            },
            last_strike: {
              bsonType: 'date',
              description: 'Last strike time. Used on moderation logic',
            },
          },
        },
      },
    });

    await db.collection('strikes').createIndex(
      {
        server_id: 1,
        user_id: 1,
      },
      {
        unique: true,
      },
    );
  },

  async down(db, client) {
    await db.collection('strikes').dropIndexes();
    await db.collection('strikes').drop();
  },
};
