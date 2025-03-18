/**
 * Generates a 5-character crypto value from a quark name
 */
export function generateCryptoFromQuark(quark: string): string {
  // Remove the q- prefix if it exists
  const cleanQuark = quark.replace(/^q-/, '');
  
  // Create hash from string
  let hash = 0;
  for (let i = 0; i < cleanQuark.length; i++) {
    const char = cleanQuark.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use only letters for the first character
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  // Letters and numbers for the rest of the characters
  const fullAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  // The first character is always a letter
  const firstChar = alphabet[Math.abs(hash) % alphabet.length];
  
  let crypto = firstChar;
  const positiveHash = Math.abs(hash);
  
  // Generate the remaining 4 characters
  for (let i = 1; i < 5; i++) {
    const index = (positiveHash >> (i * 5)) & 31;
    crypto += fullAlphabet[index % fullAlphabet.length];
  }

  return crypto;
} 

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
    // Защита от undefined или null
    if (!classes) {
      classes = '';
    }
    if (!componentName) {
      componentName = 'component';
    }
    if (!elementType) {
      elementType = 'div';
    }
    
    // Убедимся, что все значения - строки
    const classesStr = String(classes);
    const componentNameStr = String(componentName);
    const elementTypeStr = String(elementType);
    
    const cacheKey = `${classesStr}-${componentNameStr}-${elementTypeStr}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const quark = this.generateQuarkName(classesStr, config.quarkPrefix);
    const crypto = generateCryptoFromQuark(quark);
    const semantic = this.generateSemanticName(
      componentNameStr, 
      elementTypeStr, 
      classesStr, 
      config.semanticPrefix
    );

    const result = { quark, crypto, semantic };
    this.cache.set(cacheKey, result);
    
    return result;
  }

  private generateQuarkName(classes: string, prefix: string): string {
    if (!classes) {
      return `${prefix}empty`;
    }
    
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
  
    return `${prefix}${quarkId || 'empty'}`;
  }

  private generateSemanticName(
    componentName: string, 
    elementType: string, 
    classes: string, 
    prefix: string
  ): string {
    if (!componentName) componentName = 'component';
    if (!elementType) elementType = 'div';
    if (!classes) classes = '';
    
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
  if (!classString) {
    return '';
  }
  return String(classString).split(' ').sort().join(' ');
} 

export const nameGenerator = NameGenerator.getInstance(); 