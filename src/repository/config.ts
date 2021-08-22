import { Client, errors, query as q } from 'faunadb';
import { Configuration } from '../entity/config';

export interface ConfigurationRepository {
  getConfig: (id: string) => Promise<Configuration | null>;
  createConfig: (id: string, config: Configuration) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
}

export class FaunaConfigurationRepository implements ConfigurationRepository {
  public constructor(private readonly client: Client) {}

  public async createConfig(
    id: string,
    config: Configuration,
  ): Promise<void> {
    await this.client.query(
      q.Create(
        q.Ref(
          q.Collection('configurations'),
          id,
        ),
        {
          data: config,
        },
      ),
    );
  }

  public async getConfig(id: string): Promise<Configuration | null> {
    try {
      const document: Record<string, any> = await this.client.query(
        q.Get(
          q.Ref(
            q.Collection('configurations'),
            id,
          ),
        ),
      );

      return document['data'];
    } catch (err) {
      const error = err as Error;

      if (error instanceof errors.NotFound) {
        return null;
      }

      throw error;
    }
  }

  public async deleteConfig(id: string): Promise<void> {
    await this.client.query(
      q.Delete(
        q.Ref(
          q.Collection('configurations'),
          id,
        ),
      ),
    );
  }
}
