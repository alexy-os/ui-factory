import { EnhancedClassEntry, ClassNameConfig } from '../types';
import { nameGenerator } from '../../../utils/name-generator';
import { extractModifiers } from '../../../utils/pattern-extractor';

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
): EnhancedClassEntry {
  const { modifiers } = extractModifiers(classes, componentName, elementType);
  
  // Генерируем имена только если нет модификаторов
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