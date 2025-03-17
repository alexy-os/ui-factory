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
    
    // Find all tv/cva configurations in the content
    const tvPattern = /(?:tv|cva)\(\s*\{([\s\S]*?)\}\s*\)/g;
    let tvMatch;
    
    while ((tvMatch = tvPattern.exec(content)) !== null) {
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
      
      // Extract variant groups
      const variantSections = tvContent.match(/variants:\s*\{([\s\S]*?)\}/g);
      if (variantSections) {
        for (const variantSection of variantSections) {
          // Find all variant groups (like variant, size, etc)
          const variantGroups = variantSection.match(/(\w+):\s*\{([\s\S]*?)\}/g);
          
          if (variantGroups) {
            for (const group of variantGroups) {
              // Get group name (variant, size, etc)
              const groupNameMatch = /(\w+):\s*\{/.exec(group);
              if (!groupNameMatch) continue;
              
              const groupName = groupNameMatch[1];
              
              // Extract individual variants
              const variantPattern = /(\w+):\s*['"`](.*?)['"`]/g;
              let variantMatch;
              
              while ((variantMatch = variantPattern.exec(group)) !== null) {
                const variantName = variantMatch[1];
                const variantClasses = variantMatch[2].trim();
                
                // Create element type combining group and variant
                const elementType = `${groupName}-${variantName}`;
                
                const entry = createClassEntry(
                  variantClasses,
                  componentName,
                  componentDir,
                  elementType,
                  { [groupName]: variantName },
                  config
                );
                
                if (entry) classEntries.push(entry);
              }
            }
          }
        }
      }
    }
    
    return classEntries;
  }
} 