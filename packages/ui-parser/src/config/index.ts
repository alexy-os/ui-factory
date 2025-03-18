import { PatternContextType } from '../adapters/regex/types';
import { defaultPaths, PathsConfig } from './paths-config';
import { defaultFormats, FileFormatConfig } from './file-formats-config';
import { defaultPatterns, PatternConfig, PatternsConfig } from './patterns-config';
import { ConfigValidator, ValidationResult, ValidationError } from '../utils/validator';
import path from 'path';
import fs from 'fs';

export type ExtractorType = 'dom' | 'regex';

export type { PatternConfig, PatternsConfig, PathsConfig, FileFormatConfig };

export interface UIParserConfig {
  paths: PathsConfig;
  classNames: {
    semanticPrefix: string;
    quarkPrefix: string;
  };
  extractor: ExtractorType;
  formats: Record<string, FileFormatConfig>;
  patterns: PatternsConfig;
}

export interface ConfigJson {
  formats?: Record<string, {
    extensions: string[];
    patterns: {
      className: Array<{
        name: string;
        pattern: string;
      }>;
      contextType: PatternContextType;
    }
  }>;
  patterns?: {
    layout?: Array<{ pattern: string; name?: string }>;
    sizing?: Array<{ pattern: string; name?: string }>;
    typography?: Array<{ pattern: string; name?: string }>;
    interaction?: Array<{ pattern: string; name?: string }>;
    decoration?: Array<{ pattern: string; name?: string }>;
  };
}

function convertJsonPatternsToRegExp(jsonFormats: ConfigJson['formats']): Record<string, FileFormatConfig> {
  if (!jsonFormats) return {};

  const result: Record<string, FileFormatConfig> = {};

  for (const [key, format] of Object.entries(jsonFormats)) {
    try {
      result[key] = {
        extensions: format.extensions,
        patterns: {
          className: format.patterns.className.map(p => ({
            name: p.name,
            pattern: new RegExp(p.pattern, 'g')
          })),
          contextType: format.patterns.contextType
        }
      };
    } catch (e) {
      console.error(`Error converting pattern for format ${key}:`, e);
    }
  }

  return result;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: UIParserConfig;
  private configFilePath: string | null = null;
  private validationResult: ValidationResult | null = null;

  private constructor() {
    this.config = this.loadConfiguration();
  }
  
  private loadConfiguration(): UIParserConfig {
    let jsonConfig: ConfigJson = {};
    
    // List of possible paths to find config.type.json
    const possiblePaths = [
      // 1. In the componentOutput folder (priority 1)
      path.join(defaultPaths.componentOutput, 'config.type.json'),
      // 2. In the root of the project (priority 2)
      path.resolve(process.cwd(), 'config.type.json'),
      // 3. In the configuration folder (priority 3)
      path.resolve(process.cwd(), './src/scripts/ui-parser/src/config/config.type.json')
    ];
    
    // Search for the first existing configuration file
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        this.configFilePath = possiblePath;
        break;
      }
    }
    
    try {
      if (this.configFilePath && fs.existsSync(this.configFilePath)) {
        const fileContent = fs.readFileSync(this.configFilePath, 'utf-8');
        jsonConfig = JSON.parse(fileContent);
        
        console.log(`Using configuration from: ${this.configFilePath}`);
        
        const jsonValidation = ConfigValidator.validateJsonConfig(jsonConfig);
        if (!jsonValidation.valid) {
          console.error('Invalid JSON configuration:', jsonValidation.errors);
          jsonConfig = {};
        }
      } else {
        console.log('No config.type.json found, using default configuration');
      }
    } catch (error) {
      console.warn('Failed to load configuration from JSON file:', error);
      console.warn('Using default configuration');
    }

    const config: UIParserConfig = {
      paths: defaultPaths,
      classNames: {
        semanticPrefix: 'sc-',
        quarkPrefix: 'q-',
      },
      extractor: 'regex',
      formats: defaultFormats,
      patterns: defaultPatterns
    };

    if (jsonConfig.formats) {
      config.formats = {
        ...config.formats,
        ...convertJsonPatternsToRegExp(jsonConfig.formats)
      };
    }

    if (jsonConfig.patterns) {
      config.patterns = {
        layout: jsonConfig.patterns.layout || defaultPatterns.layout,
        sizing: jsonConfig.patterns.sizing || defaultPatterns.sizing,
        typography: jsonConfig.patterns.typography || defaultPatterns.typography,
        interaction: jsonConfig.patterns.interaction || defaultPatterns.interaction,
        decoration: jsonConfig.patterns.decoration || defaultPatterns.decoration
      };
    }
    
    this.validationResult = ConfigValidator.validateConfig(config);
    if (!this.validationResult.valid) {
      console.error('Configuration validation failed:', this.validationResult.errors);
    }
    
    return config;
  }
  
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  public getConfig(): UIParserConfig {
    return this.config;
  }
  
  public getPath(key: keyof PathsConfig): string {
    if (!this.config.paths[key]) {
      console.warn(`Path '${key}' not found in configuration. Using empty string.`);
      return '';
    }
    return this.config.paths[key];
  }
  
  public getPaths(): PathsConfig {
    return { ...this.config.paths };
  }

  public getClassNamePrefix(type: 'semantic' | 'quark'): string {
    return type === 'semantic' 
      ? this.config.classNames.semanticPrefix 
      : this.config.classNames.quarkPrefix;
  }

  public getClassNames(): UIParserConfig['classNames'] {
    return { ...this.config.classNames };
  }

  public getPatterns(category: keyof PatternsConfig): PatternConfig[] {
    if (!this.config.patterns[category]) {
      console.warn(`Pattern category '${category}' not found in configuration. Using empty array.`);
      return [];
    }
    return [...this.config.patterns[category]];
  }

  public getAllPatterns(): PatternsConfig {
    return { ...this.config.patterns };
  }

  public getFormat(name: string): FileFormatConfig | undefined {
    return this.config.formats[name] 
      ? { ...this.config.formats[name] }
      : undefined;
  }

  public getFormats(): Record<string, FileFormatConfig> {
    return { ...this.config.formats };
  }

  public getSupportedExtensions(): string[] {
    const uniqueExtensions = new Set<string>();
    
    Object.values(this.config.formats).forEach(format => {
      format.extensions.forEach(ext => uniqueExtensions.add(ext));
    });
    
    return Array.from(uniqueExtensions);
  }
  
  public isFileSupported(filePath: string): boolean {
    return !!this.getPatternsForFile(filePath);
  }
  
  public getPatternsForFile(filePath: string): { 
    patterns: Array<{ pattern: RegExp; name: string }>;
    contextType: PatternContextType; 
  } | null {
    try {
      const fileExt = path.extname(filePath);
      
      for (const format of Object.values(this.config.formats)) {
        if (format.extensions.includes(fileExt)) {
          if (!format.patterns?.className?.length) {
            return null;
          }
          
          return {
            patterns: format.patterns.className,
            contextType: format.patterns.contextType
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in getPatternsForFile:', error);
      return null;
    }
  }
  
  public isValid(): boolean {
    return this.validationResult !== null && this.validationResult.valid;
  }

  public getValidationErrors(): ValidationError[] {
    return this.validationResult?.errors || [];
  }

  public updateConfig(newConfig: Partial<UIParserConfig>): void {
    const updatedConfig = {
      ...this.config,
      ...newConfig,
      paths: {
        ...this.config.paths,
        ...(newConfig.paths || {}),
      },
      classNames: {
        ...this.config.classNames,
        ...(newConfig.classNames || {}),
      },
      formats: {
        ...this.config.formats,
        ...(newConfig.formats || {}),
      },
      patterns: {
        ...this.config.patterns,
        ...(newConfig.patterns || {}),
      }
    };
    
    const validation = ConfigValidator.validateConfig(updatedConfig);
    if (!validation.valid) {
      console.error('Invalid configuration update:', validation.errors);
      this.validationResult = validation;
    } else {
      this.validationResult = validation;
    }
    
    this.config = updatedConfig;
  }

  public updatePaths(paths: Partial<PathsConfig>): void {
    this.config.paths = {
      ...this.config.paths,
      ...paths,
    };
  }

  public setPath(key: keyof PathsConfig, value: string): void {
    this.config.paths[key] = value;
  }

  public updateClassNames(classNames: Partial<UIParserConfig['classNames']>): void {
    this.config.classNames = {
      ...this.config.classNames,
      ...classNames,
    };
  }

  public setExtractor(type: ExtractorType): void {
    if (type !== 'dom' && type !== 'regex') {
      console.warn(`Invalid extractor type: ${type}. Must be 'dom' or 'regex'.`);
      return;
    }
    this.config.extractor = type;
  }

  public getExtractor(): ExtractorType {
    return this.config.extractor;
  }

  public saveConfigToFile(): boolean {
    try {
      const validation = ConfigValidator.validateConfig(this.config);
      if (!validation.valid) {
        console.error('Cannot save invalid configuration:', validation.errors);
        return false;
      }
      
      // If the file path is not defined, use the default path in componentOutput
      if (!this.configFilePath) {
        this.configFilePath = path.join(this.config.paths.componentOutput, 'config.type.json');
      }
      
      const jsonConfig = this.convertConfigToJson();
      
      fs.writeFileSync(
        this.configFilePath,
        JSON.stringify(jsonConfig, null, 2),
        'utf-8'
      );
      
      return true;
    } catch (error) {
      console.error('Failed to save configuration to file:', error);
      return false;
    }
  }
  
  private convertConfigToJson(): ConfigJson {
    const jsonFormats: Record<string, any> = {};
    
    for (const [key, format] of Object.entries(this.config.formats)) {
      jsonFormats[key] = {
        extensions: format.extensions,
        patterns: {
          className: format.patterns.className.map(p => ({
            name: p.name,
            pattern: p.pattern.toString().slice(1, -2)
          })),
          contextType: format.patterns.contextType
        }
      };
    }

    return {
      formats: jsonFormats,
      patterns: this.config.patterns
    };
  }
}

export const configManager = ConfigManager.getInstance();

let hasWarnedAboutConfig = false;

export const CONFIG = new Proxy(configManager.getConfig(), {
  get: function(target, prop) {
    if (!hasWarnedAboutConfig) {
      console.warn('WARNING: Direct access to CONFIG is deprecated. Please use configManager methods instead.');
      hasWarnedAboutConfig = true;
    }
    return target[prop as keyof UIParserConfig];
  }
});