import { nameGenerator } from '../utils';
import { 
  EnhancedClassEntry,
  ClassNameConfig,
  PatternContextType
} from '../../types';
import { extractModifiers } from './modifiers';
import { isValidTailwindClass } from '../utils/class-validator';

function validateClasses(classes: string): boolean {
  if (!classes || typeof classes !== 'string') return false;
  const individualClasses = classes.split(/\s+/);
  return individualClasses.every(cls => isValidTailwindClass(cls));
}

/**
 * Creates an enhanced class entry from extracted class information
 */
export function createClassEntry(
  classes: string,
  componentName: string,
  componentDir: string,
  elementType: string,
  variants: Record<string, string> = {},
  config: ClassNameConfig
): EnhancedClassEntry | null {
  // Validate classes first
  if (!classes || !validateClasses(classes.trim())) {
    console.warn(`Skipping invalid class entry: ${classes}`);
    return null;
  }

  const { modifiers } = extractModifiers(classes, componentName, elementType);
  
  // Generate names only if there are no modifiers
  let quark = '', crypto = '', semantic = '';
  
  if (modifiers.length === 0) {
    const names = nameGenerator.generate(classes, componentName, elementType, config);
    quark = names.quark;
    crypto = names.crypto;
    semantic = names.semantic;
  }
  
  return {
    quark,
    crypto,
    semantic,
    classes: classes.trim(),
    componentName,
    elementType,
    variants,
    isPublic: true,
    components: {
      [componentName]: {
        path: componentDir,
        name: componentName
      }
    },
    modifiers
  };
}

export function determineElementType(
  content: string,
  position: number,
  contextType: PatternContextType
): string {
  if (contextType === 'jsx') {
    const beforeContent = content.substring(0, position);
    const tagMatch = beforeContent.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s|>)[^<]*$/);
    
    if (tagMatch) {
      return tagMatch[1].toLowerCase();
    }
  }
  
  if (contextType === 'const') {
    const contextWindow = content.substring(Math.max(0, position - 200), position);
    
    if (contextWindow.match(/Button|btn|button/i)) return 'button';
    if (contextWindow.match(/Link|anchor|a>/i)) return 'a';
    if (contextWindow.match(/heading|h[1-6]/i)) return 'h2';
    if (contextWindow.match(/paragraph|p>/i)) return 'p';
    if (contextWindow.match(/image|img/i)) return 'img';
  }
  
  return 'div';
} 

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
        const entry = createClassEntry(
          classes,
          componentName,
          componentDir,
          elementType,
          {},
          config
        );
        if (entry) classEntries.push(entry); // Only add valid entries
      }
    }

    return classEntries;
  }
} 