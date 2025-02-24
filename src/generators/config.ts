import { BuilderConfig } from './types';
import path from 'path';

export const DEFAULT_CONFIG: BuilderConfig = {
  outDir: path.resolve(process.cwd(), 'public'),
  templates: [],
  defaultStyles: ['index.css']
};

export class ConfigManager {
  private config: BuilderConfig;

  constructor(userConfig?: Partial<BuilderConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...userConfig,
    };
  }

  getConfig(): BuilderConfig {
    return this.config;
  }

  validateConfig(): boolean {
    if (!this.config.outDir) {
      throw new Error('Output directory is required');
    }

    if (!Array.isArray(this.config.templates)) {
      throw new Error('Templates must be an array');
    }

    return true;
  }
} 