import fs from 'fs';
import path from 'path';
import { defaultPatterns } from '../config/patterns-config';
import { defaultFormats } from '../config/file-formats-config';
import { configManager } from '../config';

/**
 * Options for generating the configuration file
 */
export interface ConfigGenerationOptions {
  outputPath?: string;
  updateExisting?: boolean;
}

/**
 * Class for managing the generation of the configuration file
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
   * Converts an object with RegExp to an object with strings for JSON
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
   * Generates the configuration file
   */
  public generate(options: ConfigGenerationOptions = {}): void {
    try {
      const outputDir = options.outputPath || configManager.getPath('componentOutput');
      
      // Create the directory if it doesn't exist
      fs.mkdirSync(outputDir, { recursive: true });
      
      // Path to the configuration file
      const configFilePath = path.join(outputDir, 'config.type.json');
      
      // Existing configuration, if update is needed
      let existingConfig: any = {};
      
      // If update is needed and the file exists
      if (options.updateExisting && fs.existsSync(configFilePath)) {
        try {
          existingConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
          console.log(`Updating existing configuration at: ${configFilePath}`);
        } catch (error) {
          console.warn(`Error reading existing config at ${configFilePath}, creating new one:`, error);
        }
      }
      
      // Prepare the configuration object from default files
      const formatsObj = this.regExpToString(defaultFormats);
      
      // Combine with existing configuration, if update is needed
      const configObject = options.updateExisting 
        ? {
            formats: { ...existingConfig.formats, ...formatsObj },
            patterns: { ...existingConfig.patterns, ...defaultPatterns }
          }
        : {
            formats: formatsObj,
            patterns: defaultPatterns
          };
      
      // Write the configuration to the JSON file
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