import fs from 'fs';
import path from 'path';
import { ClassExtractorAdapter } from '../base-adapter';
import { EnhancedClassEntry } from '../../core/types';
import { deduplicateEntries } from '../../utils/deduplication';
import { TailwindVariantsExtractor } from './extractors/tv-extractor';
import { ClassNameExtractor } from './extractors/className-extractor';

export class RegexExtractorAdapter implements ClassExtractorAdapter {
  readonly name = 'Regex Extractor';
  
  supportsComponent(componentPath: string): boolean {
    const ext = path.extname(componentPath).toLowerCase();
    return ['.tsx', '.jsx', '.js', '.ts'].includes(ext);
  }
  
  async extractClasses(componentPath: string): Promise<EnhancedClassEntry[]> {
    try {
      const content = fs.readFileSync(componentPath, 'utf-8');
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const componentDir = path.dirname(componentPath);
      
      const classEntries: EnhancedClassEntry[] = [
        ...TailwindVariantsExtractor.extract(content, componentName, componentDir),
        ...ClassNameExtractor.extract(content, componentName, componentDir)
      ];

      return deduplicateEntries(classEntries);
    } catch (error) {
      console.error(`Error analyzing component with regex:`, error);
      return [];
    }
  }
}

export default RegexExtractorAdapter; 