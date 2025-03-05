import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from './types/index';
import { deduplicateEntries } from './utils/deduplication';
import { TailwindVariantsExtractor } from './extractors/tv-extractor';
import { ClassNameExtractor } from './extractors/className-extractor';

export class RegexExtractorAdapter {
  readonly name = 'Regex Extractor';
  
  /**
   * Checks if the adapter can process the given component file
   * @param componentPath - Path to the component file
   * @returns boolean indicating support for the file type
   */
  supportsComponent(componentPath: string): boolean {
    const ext = path.extname(componentPath).toLowerCase();
    return ['.tsx', '.jsx', '.js', '.ts'].includes(ext);
  }
  
  /**
   * Extracts CSS classes from a component file
   * @param componentPath - Path to the component file
   * @returns Promise resolving to an array of enhanced class entries
   */
  async extractClasses(componentPath: string): Promise<EnhancedClassEntry[]> {
    try {
      const content = fs.readFileSync(componentPath, 'utf-8');
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const componentDir = path.dirname(componentPath);
      
      const classEntries: EnhancedClassEntry[] = [
        ...TailwindVariantsExtractor.extract(content, componentName, componentDir).map(entry => ({
          ...entry,
          variants: Object.keys(entry.variants).reduce((acc, key) => {
            const value = entry.variants[key];
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, string>)
        })),
        ...ClassNameExtractor.extract(content, componentName, componentDir).map(entry => ({
          ...entry,
          variants: Object.keys(entry.variants).reduce((acc, key) => {
            const value = entry.variants[key];
            if (value !== undefined) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, string>)
        }))
      ];

      return deduplicateEntries(classEntries);
    } catch (error) {
      console.error(`Error analyzing component with regex:`, error);
      return [];
    }
  }
}

export default RegexExtractorAdapter; 