import fs from 'fs';
import path from 'path';
import { configManager } from './config';
import { EnhancedClassEntry, RegexExtractorConfig } from './types';
import { deduplicateEntries } from './utils/deduplication';
import { ClassNameExtractor } from './extractors/extractor';
import { TVExtractor } from './extractors/tv-extractor';
import { CVAExtractor } from './extractors/cva-extractor';

export class RegexExtractorAdapter {
  readonly name = 'Regex Extractor';
  private config: RegexExtractorConfig;
  
  constructor(config?: Partial<RegexExtractorConfig>) {
    this.config = {
      classNames: {
        quarkPrefix: configManager.getClassNamePrefix('quark'),
        semanticPrefix: configManager.getClassNamePrefix('semantic'),
        ...(config?.classNames || {})
      }
    };
  }

  /**
   * Updates adapter configuration
   */
  configure(config: Partial<RegexExtractorConfig>): void {
    this.config = {
      ...this.config,
      classNames: {
        ...this.config.classNames,
        ...(config.classNames || {})
      }
    };
  }

  /**
   * Gets current configuration
   */
  getConfig(): RegexExtractorConfig {
    return { ...this.config };
  }
  
  /**
   * Checks if the adapter can process the given component file
   */
  supportsComponent(componentPath: string): boolean {
    return configManager.isFileSupported(componentPath);
  }
  
  /**
   * Extracts CSS classes from a component file
   */
  async extractClasses(componentPath: string): Promise<EnhancedClassEntry[]> {
    try {
      const content = fs.readFileSync(componentPath, 'utf-8');
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const componentDir = path.dirname(componentPath);
      
      const filePatterns = configManager.getPatternsForFile(componentPath);
      if (!filePatterns) {
        console.warn(`No patterns found for file: ${componentPath}`);
        return [];
      }

      const classEntries: EnhancedClassEntry[] = [
        ...ClassNameExtractor.extract(
          content, 
          componentName, 
          componentDir,
          this.config.classNames,
          filePatterns
        ),
        ...TVExtractor.extract(
          content,
          componentName,
          componentDir,
          this.config.classNames
        ),
        ...CVAExtractor.extract(
          content,
          componentName,
          componentDir,
          this.config.classNames
        ),
      ];

      return deduplicateEntries(classEntries);
    } catch (error) {
      console.error(`Error analyzing component with regex:`, error);
      return [];
    }
  }
}

export default RegexExtractorAdapter; 