import { EnhancedClassEntry } from '../../../core/types';
import { CONFIG } from '../../../config';

export function createClassEntry(
  classes: string,
  componentName: string,
  componentDir: string,
  elementType: string,
  variants: Record<string, string> = {}
): EnhancedClassEntry {
  return {
    quark: generateQuarkName(classes),
    semantic: generateSemanticName(componentName, elementType, classes),
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
    }
  };
}

function generateQuarkName(classes: string): string {
  const normalizedClasses = normalizeClassString(classes);
  
  const quarkId = normalizedClasses
    .split(' ')
    .map(cls => {
      const parts = cls.split(':');
      const baseCls = parts[parts.length - 1];
      
      const cleanCls = baseCls
        .replace(/[\[\]\/\(\)]/g, '')
        .replace(/[&>~=]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '');
      
      if (cleanCls.match(/^\d/)) {
        return cleanCls.replace(/[^\d]/g, '');
      }
      
      return cleanCls
        .split('-')
        .map(word => word[0] || '')
        .join('')
        .toLowerCase();
    })
    .join('');

  return `${CONFIG.classNames.quarkPrefix}${quarkId}`;
}

function generateSemanticName(componentName: string, elementType: string, classes: string): string {
  const normalizedClasses = normalizeClassString(classes);
  const classIdentifier = normalizedClasses
    .split(' ')
    .map(cls => {
      const baseCls = cls.split(':').pop() || '';
      
      return baseCls
        .replace(/[\[\]\/\(\)]/g, '-')
        .replace(/[&>~=]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    })
    .filter(Boolean)
    .join('-');

  return `${CONFIG.classNames.semanticPrefix}${componentName.toLowerCase()}-${elementType}${classIdentifier ? `-${classIdentifier}` : ''}`;
}

function normalizeClassString(classString: string): string {
  return classString.split(' ').sort().join(' ');
} 