import { EnhancedClassEntry, ClassNameConfig, PatternContextType } from '../types';
import { createClassEntry } from '../utils/class-entry';
import { determineElementType } from '../utils/element-type';

export class ClassNameExtractor {
  static extract(
    content: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig,
    filePatterns: { patterns: Array<{ pattern: RegExp; name: string }>; contextType: string }
  ): EnhancedClassEntry[] {
    const classEntries: EnhancedClassEntry[] = [];

    for (const { pattern } of filePatterns.patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classes = match[1];
        const elementType = determineElementType(content, match.index, filePatterns.contextType as PatternContextType);
        classEntries.push(
          createClassEntry(
            classes,
            componentName,
            componentDir,
            elementType,
            {},
            config
          )
        );
      }
    }

    return classEntries;
  }
} 