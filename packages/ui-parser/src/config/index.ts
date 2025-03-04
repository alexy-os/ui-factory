import path from 'path';

/**
 * Тип экстрактора
 */
export type ExtractorType = 'dom' | 'regex';

/**
 * Конфигурация UI Parser
 */
export interface UIParserConfig {
  paths: {
    sourceDir: string;
    componentOutput: string;
    classObject: string;
    domAnalysisResults: string;
  };
  classNames: {
    semanticPrefix: string;
    quarkPrefix: string;
  };
  extractor: ExtractorType;
}

/**
 * Класс для управления конфигурацией
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: UIParserConfig;

  private constructor() {
    // Значения по умолчанию
    this.config = {
      paths: {
        sourceDir: path.resolve(process.cwd(), './src/source'),
        componentOutput: path.resolve(process.cwd(), './src/components'),
        classObject: path.resolve(process.cwd(), './src/components/classObject.ts'),
        domAnalysisResults: path.resolve(process.cwd(), './src/components/domAnalysis.json'),
      },
      classNames: {
        semanticPrefix: 'semantic-',
        quarkPrefix: 'q-',
      },
      extractor: 'regex' // По умолчанию используем regex экстрактор
    };
  }

  /**
   * Получение экземпляра ConfigManager (Singleton)
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Получение текущей конфигурации
   */
  public getConfig(): UIParserConfig {
    return this.config;
  }

  /**
   * Обновление конфигурации
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
   * Обновление путей в конфигурации
   */
  public updatePaths(paths: Partial<UIParserConfig['paths']>): void {
    this.config.paths = {
      ...this.config.paths,
      ...paths,
    };
  }

  /**
   * Обновление настроек имен классов
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

// Экспортируем экземпляр для удобного использования
export const configManager = ConfigManager.getInstance();
export const CONFIG = configManager.getConfig();

export default configManager; 