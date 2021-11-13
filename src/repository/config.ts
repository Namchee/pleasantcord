import fetch from 'node-fetch';
import { Client, errors, query as q } from 'faunadb';

import { BASE_CONFIG, Configuration } from '../entity/config';
import { Logger } from '../utils/logger';

import type { HeadersInit } from 'node-fetch';
import { Label } from '../entity/content';

export interface ConfigurationRepository {
  setBotId: (id: string) => void;
  getConfig: (id: string) => Promise<Configuration | null>;
  createConfig: (id: string, config: Configuration) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
}

export class FaunaConfigurationRepository implements ConfigurationRepository {
  public constructor(private readonly client: Client) {}

  public setBotId(): void {
    throw new Error('Fauna DB does not need this');
  }

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

export class CloudflareConfigurationRepository
implements ConfigurationRepository {
  private userId: string;

  public constructor(
    private readonly url: string,
    private readonly apiKey: string,
  ) {}

  private get headers(): HeadersInit {
    return {
      Authorization: `pleasantcord ${this.apiKey}/${this.userId}`,
    };
  }


  public setBotId(id: string): void {
    this.userId = id;
  }

  public async getConfig(id: string): Promise<Configuration | null> {
    try {
      const result = await fetch(
        `${this.url}/config/${id}`,
        {
          method: 'GET',
          headers: this.headers,
        },
      );

      const json = await result.json();

      return this.convertConfigToRawConfig(json.data);
    } catch (err) {
      Logger.getInstance().logBot(
        new Error('Failed to fetch configuration from API'),
      );

      return BASE_CONFIG;
    }
  }

  public async createConfig(id: string, config: Configuration): Promise<void> {
    const result = await fetch(
      `${this.url}/config`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          server_id: id,
          ...config,
        }),
      },
    );

    if (!result.ok) {
      Logger.getInstance().logBot(
        new Error('Failed to create configuration'),
      );
    }
  }

  public async deleteConfig(id: string): Promise<void> {
    const result = await fetch(
      `${this.url}/config/${id}`,
      {
        method: 'DELETE',
        headers: this.headers,
      },
    );

    if (!result.ok) {
      Logger.getInstance().logBot(
        new Error('Failed to delete configuration'),
      );
    }
  }

  private convertConfigToRawConfig(
    config: Record<string, unknown>,
  ): Configuration {
    return {
      accuracy: config['accuracy'] as number,
      categories: (config['categories'] as Record<string, unknown>[])
        .map(val => val.name as Label),
      delete: config['delete'] as boolean,
    };
  }
}
