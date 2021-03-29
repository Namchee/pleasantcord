// @ts-check

module.exports = {
  async up(db, client) {
    await db.createCollection('strikes', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'serverId',
            'userId',
            'count',
            'lastUpdated',
          ],
          properties: {
            serverId: {
              bsonType: 'string',
              description: 'Discord server ID',
            },
            userId: {
              bsonType: 'string',
              description: 'Server member ID',
            },
            count: {
              bsonType: 'int',
              description: 'How many strikes in the current cycle',
            },
            lastUpdated: {
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
    );
  },

  async down(db, client) {
    await db.collection('strikes').dropIndexes();
    await db.collection('strikes').drop();
  },
};
