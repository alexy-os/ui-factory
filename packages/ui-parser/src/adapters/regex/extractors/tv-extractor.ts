import { EnhancedClassEntry, ClassNameConfig } from '../types';
import { createClassEntry } from './extractor';

export class TVExtractor {
  /**
   * Extracts utility classes from tailwind-variants (tv/cva) configurations
   */
  static extract(
    content: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig
  ): EnhancedClassEntry[] {
    const classEntries: EnhancedClassEntry[] = [];
    
    // Protection against null, undefined or empty values
    if (!content || !componentName || !componentDir) {
      console.warn('TVExtractor.extract called with invalid parameters');
      return classEntries;
    }

    // Find all tv/cva configurations in the content
    const tvPattern = /(?:tv|cva)\(\s*\{([\s\S]*?)\}\s*\)/g;
    let tvMatch;
    
    while ((tvMatch = tvPattern.exec(content)) !== null) {
      if (!tvMatch[1]) continue; // Protection against missing captured group
      
      const tvContent = tvMatch[1];
      
      // Extract base classes
      const baseMatch = /base:\s*['"`](.*?)['"`]/g.exec(tvContent);
      if (baseMatch && baseMatch[1]) {
        const baseClasses = baseMatch[1].trim();
        const entry = createClassEntry(
          baseClasses,
          componentName,
          componentDir,
          'base',
          { variant: 'base' },
          config
        );
        if (entry) classEntries.push(entry);
      }
      
      // Extract variants section
      const variantsMatch = /variants:\s*({[\s\S]*?})\s*(?=,\s*defaultVariants|$)/g.exec(tvContent);
      
      if (variantsMatch && variantsMatch[1]) {
        const variantsContent = variantsMatch[1];
        
        // Extract each variant group (variant, size, etc)
        const groups = variantsContent.match(/\w+:\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g) || [];
        
        for (const group of groups) {
          const groupMatch = /(\w+):\s*{([\s\S]*?)}/g.exec(group);
          if (!groupMatch || !groupMatch[1] || !groupMatch[2]) continue;
          
          const groupName = groupMatch[1];
          const groupContent = groupMatch[2];
          
          // Extract only the class values from each variant
          const variantPattern = /['"`](.*?)['"`]/g;
          let variantMatch;
          
          while ((variantMatch = variantPattern.exec(groupContent)) !== null) {
            if (!variantMatch[1]) continue;
            
            const variantClasses = variantMatch[1].trim();
            if (!variantClasses) continue;
            
            const entry = createClassEntry(
              variantClasses,
              componentName,
              componentDir,
              `${groupName}`,
              { [groupName]: 'value' },
              config
            );
            
            if (entry) {
              classEntries.push(entry);
            }
          }
        }
      }
    }
    
    return classEntries;
  }
} 