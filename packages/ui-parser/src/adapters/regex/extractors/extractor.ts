import { nameGenerator } from '../utils';
import { 
  EnhancedClassEntry,
  ClassNameConfig,
  PatternContextType
} from '../types';
import { extractModifiers } from './modifiers';

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
  // Protection against undefined or null
  if (!classes) {
    console.warn(`Skipping empty classes in component ${componentName}`);
    return null;
  }

  // Ensure classes is a string
  const classesString = String(classes);
  
  const { modifiers } = extractModifiers(classesString, componentName, elementType);
  
  // Generate names only if there are no modifiers
  let quark = '', crypto = '', semantic = '';
  const names = nameGenerator.generate(classesString, componentName, elementType, config);
  
  //if (modifiers.length === 0) {
    quark = names.quark;
    crypto = names.crypto;
    semantic = names.semantic;
  //}
  
  return {
    quark,
    crypto,
    semantic,
    classes: classesString.trim(),
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
    
    // Protection against undefined or null
    if (!content || !componentName || !componentDir || !filePatterns || !filePatterns.patterns) {
      console.warn('ClassNameExtractor.extract called with invalid parameters');
      return classEntries;
    }

    for (const { pattern } of filePatterns.patterns) {
      if (!pattern) continue;
      
      try {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          try {
            const classes = match[1];
            if (!classes) continue;
            
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
          } catch (err) {
            console.warn(`Error processing match in ${componentName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.warn(`Error applying regex pattern in ${componentName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return classEntries;
  }
} 