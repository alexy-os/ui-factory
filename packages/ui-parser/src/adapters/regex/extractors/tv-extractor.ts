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
    
    console.log('Starting extraction for component:', componentName);
    console.log('Content:', content);

    // Find all tv/cva configurations in the content
    const tvPattern = /(?:tv|cva)\(\s*\{([\s\S]*?)\}\s*\)/g;
    let tvMatch;
    
    while ((tvMatch = tvPattern.exec(content)) !== null) {
      console.log('Found tv/cva configuration:', tvMatch[1]);
      const tvContent = tvMatch[1];
      
      // Extract base classes
      const baseMatch = /base:\s*['"`](.*?)['"`]/g.exec(tvContent);
      if (baseMatch && baseMatch[1]) {
        console.log('Found base classes:', baseMatch[1]);
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
      
      if (variantsMatch) {
        const variantsContent = variantsMatch[1];
        
        // Extract each variant group (variant, size, etc)
        const groups = variantsContent.match(/\w+:\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g) || [];
        
        for (const group of groups) {
          const groupMatch = /(\w+):\s*{([\s\S]*?)}/g.exec(group);
          if (!groupMatch) continue;
          
          const groupName = groupMatch[1];
          const groupContent = groupMatch[2];
          
          // Extract only the class values from each variant
          const variantPattern = /['"`](.*?)['"`]/g;
          let variantMatch;
          
          while ((variantMatch = variantPattern.exec(groupContent)) !== null) {
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
              console.log('Created entry:', entry);
              classEntries.push(entry);
            }
          }
        }
      }
    }
    
    console.log('Final extracted entries:', classEntries);
    return classEntries;
  }
} 