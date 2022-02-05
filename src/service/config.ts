import {
  ConfigurationCache,
  ConfigurationRepository,
} from '@/repository/config';

import type { Configuration } from '@/entity/config';

export class ConfigurationService {
  public constructor(
    public readonly cache: ConfigurationCache,
    public readonly repository: ConfigurationRepository,
  ) {}

  public async getConfig(id: string): Promise<Configuration | null> {
    const cachedConfig = this.cache.getConfig(id);

    if (cachedConfig) {
      return cachedConfig;
    }

    const config = await this.repository.getConfig(id);

    if (config) {
      this.cache.setConfig(id, config);
    }

    return config;
  }

  public async createConfig(id: string, config: Configuration): Promise<void> {
    const result = await this.repository.createConfig(id, config);

    if (result) {
      this.cache.setConfig(id, config);
    }
  }

  public async deleteConfig(id: string): Promise<void> {
    const result = await this.repository.deleteConfig(id);

    if (result) {
      this.cache.deleteConfig(id);
    }
  }
}
