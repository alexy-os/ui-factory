import fs from 'fs';
import path from 'path';
import { defaultPatterns } from '../config/patterns-config';
import { defaultFormats } from '../config/file-formats-config';
import { configManager } from '../config';

/**
 * Опции для генерации конфигурационного файла
 */
export interface ConfigGenerationOptions {
  outputPath?: string;
  updateExisting?: boolean;
}

/**
 * Класс для управления генерацией конфигурационного файла
 */
export class ConfigurationGenerator {
  private static instance: ConfigurationGenerator;
  
  private constructor() {}
  
  public static getInstance(): ConfigurationGenerator {
    if (!ConfigurationGenerator.instance) {
      ConfigurationGenerator.instance = new ConfigurationGenerator();
    }
    return ConfigurationGenerator.instance;
  }
  
  /**
   * Преобразует объект с RegExp в объект с строками для JSON
   */
  private regExpToString(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof RegExp) {
      return {
        pattern: obj.source,
        flags: obj.flags
      };
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.regExpToString(item));
    }
    
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.regExpToString(obj[key]);
      }
    }
    
    return result;
  }
  
  /**
   * Генерирует конфигурационный файл
   */
  public generate(options: ConfigGenerationOptions = {}): void {
    try {
      const outputDir = options.outputPath || configManager.getPath('componentOutput');
      
      // Создаем директорию, если она не существует
      fs.mkdirSync(outputDir, { recursive: true });
      
      // Путь к файлу конфигурации
      const configFilePath = path.join(outputDir, 'config.type.json');
      
      // Существующая конфигурация, если нужно обновить
      let existingConfig: any = {};
      
      // Если нужно обновить существующий файл и он существует
      if (options.updateExisting && fs.existsSync(configFilePath)) {
        try {
          existingConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
          console.log(`Updating existing configuration at: ${configFilePath}`);
        } catch (error) {
          console.warn(`Error reading existing config at ${configFilePath}, creating new one:`, error);
        }
      }
      
      // Подготавливаем объект конфигурации из файлов по умолчанию
      const formatsObj = this.regExpToString(defaultFormats);
      
      // Объединяем с существующей конфигурацией, если нужно обновить
      const configObject = options.updateExisting 
        ? {
            formats: { ...existingConfig.formats, ...formatsObj },
            patterns: { ...existingConfig.patterns, ...defaultPatterns }
          }
        : {
            formats: formatsObj,
            patterns: defaultPatterns
          };
      
      // Записываем конфигурацию в JSON файл
      fs.writeFileSync(
        configFilePath,
        JSON.stringify(configObject, null, 2)
      );
      
      console.log(`✓ Generated configuration file: ${configFilePath}`);
      
    } catch (error) {
      console.error('Failed to generate configuration file:', error);
      throw error;
    }
  }
}

export const configurationGenerator = ConfigurationGenerator.getInstance();

export default configurationGenerator; 