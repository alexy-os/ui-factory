import path from 'path';

/**
 * Extractor type
 */
export type ExtractorType = 'dom' | 'regex';

/**
 * UI Parser configuration
 */
export interface UIParserConfig {
  paths: {
    sourceDir: string;
    componentOutput: string;
    domAnalysisResults: string;
  };
  classNames: {
    semanticPrefix: string;
    quarkPrefix: string;
  };
  extractor: ExtractorType;
}

/**
 * Class for configuration management
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: UIParserConfig;

  private constructor() {
        this.config = {
      paths: {
        sourceDir: path.resolve(process.cwd(), './src/source'),
        componentOutput: path.resolve(process.cwd(), './src/components'),
        domAnalysisResults: path.resolve(process.cwd(), './src/components/domAnalysis.json'),
      },
      classNames: {
        semanticPrefix: 'sc-',
        quarkPrefix: 'q-',
      },
      extractor: 'regex'     };
  }

  /**
   * Get ConfigManager instance (Singleton)
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): UIParserConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<UIParserConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      paths: {
        ...this.config.paths,
        ...(newConfig.paths || {}),
      },
      classNames: {
        ...this.config.classNames,
        ...(newConfig.classNames || {}),
      }
    };
  }

  /**
   * Update paths in configuration
   */
  public updatePaths(paths: Partial<UIParserConfig['paths']>): void {
    this.config.paths = {
      ...this.config.paths,
      ...paths,
    };
  }

  /**
   * Update class name settings
   */
  public updateClassNames(classNames: Partial<UIParserConfig['classNames']>): void {
    this.config.classNames = {
      ...this.config.classNames,
      ...classNames,
    };
  }

  public setExtractor(type: ExtractorType): void {
    this.config.extractor = type;
  }

  public getExtractor(): ExtractorType {
    return this.config.extractor;
  }
}

export const configManager = ConfigManager.getInstance();
export const CONFIG = configManager.getConfig();

export default configManager; 