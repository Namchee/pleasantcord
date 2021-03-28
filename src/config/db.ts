import { Db, MongoClient } from 'mongodb';
import config from './env';

const { env } = config;

export async function getDBConnection(): Promise<Db> {
  const uri = `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const connection = await client.connect();

  return connection.db(env.MONGO_DBNAME);
}
