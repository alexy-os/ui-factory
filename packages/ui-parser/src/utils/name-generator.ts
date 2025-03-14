import { generateCryptoFromQuark } from './crypto-generator';

export class NameGenerator {
  private static instance: NameGenerator;
  private cache: Map<string, { quark: string, crypto: string, semantic: string }> = new Map();

  private constructor() {}

  public static getInstance(): NameGenerator {
    if (!NameGenerator.instance) {
      NameGenerator.instance = new NameGenerator();
    }
    return NameGenerator.instance;
  }

  public generate(
    classes: string,
    componentName: string,
    elementType: string,
    config: { quarkPrefix: string, semanticPrefix: string }
  ) {
    const cacheKey = `${classes}-${componentName}-${elementType}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const quark = this.generateQuarkName(classes, config.quarkPrefix);
    const crypto = generateCryptoFromQuark(quark);
    const semantic = this.generateSemanticName(
      componentName, 
      elementType, 
      classes, 
      config.semanticPrefix
    );

    const result = { quark, crypto, semantic };
    this.cache.set(cacheKey, result);
    
    return result;
  }

  private generateQuarkName(classes: string, prefix: string): string {
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
  
    return `${prefix}${quarkId}`;
  }

  private generateSemanticName(
    componentName: string, 
    elementType: string, 
    classes: string, 
    prefix: string
  ): string {
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
  
    return `${prefix}${componentName.toLowerCase()}-${elementType}${classIdentifier ? `-${classIdentifier}` : ''}`;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Normalizes class string by sorting and deduplicating classes
 */
function normalizeClassString(classString: string): string {
  return classString.split(' ').sort().join(' ');
} 

export const nameGenerator = NameGenerator.getInstance(); 