import fetch from 'node-fetch';

import { Configuration } from '../entity/config';
import { Logger } from '../utils/logger';

import type { HeadersInit } from 'node-fetch';
import NodeCache from 'node-cache';
import { FIVE_MINUTES } from '../constants/time';
import { APIResponse } from '../entity/api';

export interface ConfigurationCache {
  getConfig: (id: string) => Configuration | null;
  setConfig: (id: string, config: Configuration) => void;
  deleteConfig: (id: string) => void;
}

export interface ConfigurationRepository {
  getConfig: (id: string) => Promise<Configuration | null>;
  setBotId: (id: string) => void;
  createConfig: (id: string, config: Configuration) => Promise<boolean>;
  deleteConfig: (id: string) => Promise<boolean>;
}

export class LocalConfigurationCache
implements ConfigurationCache {
  public constructor(private readonly cache: NodeCache) { }

  public getConfig(id: string): Configuration | null {
    const config = this.cache.get(id);

    return config ? (config as Configuration) : null;
  }

  public setConfig(id: string, config: Configuration): void {
    this.cache.set(id, config, FIVE_MINUTES);
  }

  public deleteConfig(id: string): void {
    this.cache.del(id);
  }
}

export class CloudflareConfigurationRepository
implements ConfigurationRepository {
  private userId: string;

  public constructor(
    private readonly url: string,
    private readonly apiKey: string,
  ) { }

  private get headers(): HeadersInit {
    return {
      Authorization: `pleasantcord ${this.apiKey}/${this.userId}`,
    };
  }

  public setBotId(id: string): void {
    this.userId = id;
  }

  public async getConfig(id: string): Promise<Configuration | null> {
    const result = await fetch(
      `${this.url}/config/${id}`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );

    const json = (await result.json()) as APIResponse<Configuration>;

    if (!result.ok) {
      Logger.getInstance().logBot(
        new Error(
          `Failed to get configuration for server ${id}: ${json.error}`,
        ),
      );

      return null;
    }

    return json.data;
  }

  public async createConfig(
    id: string,
    config: Configuration,
  ): Promise<boolean> {
    const { ok, statusText } = await fetch(
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

    if (!ok) {
      Logger.getInstance().logBot(
        new Error(
          `Failed to create configuration for server ${id}: ${statusText}`,
        ),
      );
    }

    return ok;
  }

  public async deleteConfig(id: string): Promise<boolean> {
    const { ok, statusText } = await fetch(
      `${this.url}/config/${id}`,
      {
        method: 'DELETE',
        headers: this.headers,
      },
    );

    if (!ok) {
      Logger.getInstance().logBot(
        new Error(
          `Failed to delete configuration for server ${id}: ${statusText}`,
        ),
      );
    }

    return ok;
  }
}
