import { MongoClient } from 'mongodb';
import config from './env';

const { env } = config;

export async function getDBConnection(): Promise<MongoClient> {
  const uri = `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return client.connect();
}
