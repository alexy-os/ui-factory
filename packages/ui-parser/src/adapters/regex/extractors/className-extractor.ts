import { EnhancedClassEntry } from '../../../core/types';
import { CLASS_PATTERNS } from '../patterns';
import { createClassEntry } from '../utils/class-entry';
import { determineElementType } from '../utils/element-type';

export class ClassNameExtractor {
  static extract(
    content: string,
    componentName: string,
    componentDir: string
  ): EnhancedClassEntry[] {
    const classEntries: EnhancedClassEntry[] = [];

    for (const [patternName, config] of Object.entries(CLASS_PATTERNS)) {
      if (patternName === 'tvVariants') continue;

      const { pattern, contextType } = config;
      let match;

      while ((match = pattern.exec(content)) !== null) {
        const classes = match[1];
        const elementType = determineElementType(content, match.index, contextType);
        classEntries.push(createClassEntry(classes, componentName, componentDir, elementType));
      }
    }

    return classEntries;
  }
} 