import { EnhancedClassEntry, ClassNameConfig } from '../types';
import { createClassEntry } from './extractor';

export class CVAExtractor {
  /**
   * Extracts utility classes from class-variance-authority (cva) configurations
   */
  static extract(
    content: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig
  ): EnhancedClassEntry[] {
    const classEntries: EnhancedClassEntry[] = [];
    
    // Protection against null, undefined, or empty values
    if (!content || !componentName || !componentDir) {
      console.warn('CVAExtractor.extract called with invalid parameters');
      return classEntries;
    }

    try {
      // 1. Extract base classes (first argument to cva)
      this.extractBaseClasses(content, componentName, componentDir, config, classEntries);
      
      // 2. Extract variants (from second argument object)
      this.extractVariants(content, componentName, componentDir, config, classEntries);
      
    } catch (error) {
      console.warn(`Error in CVA extraction for ${componentName}:`, error);
    }
    
    return classEntries;
  }
  
  /**
   * Extracts base classes from the first argument of cva()
   */
  private static extractBaseClasses(
    content: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig,
    classEntries: EnhancedClassEntry[]
  ): void {
    // Pattern for direct string as first argument: cva("base classes", {...})
    const baseClassPattern = /cva\(\s*['"`](.*?)['"`]/g;
    let baseMatch;
    
    while ((baseMatch = baseClassPattern.exec(content)) !== null) {
      if (!baseMatch[1]) continue;
      
      const baseClasses = baseMatch[1].trim();
      if (!baseClasses) continue;
      
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
    
    // Pattern for base property in object: cva({ base: "base classes", ...})
    const baseObjectPattern = /cva\(\s*\{\s*base\s*:\s*['"`](.*?)['"`]/g;
    let baseObjMatch;
    
    while ((baseObjMatch = baseObjectPattern.exec(content)) !== null) {
      if (!baseObjMatch[1]) continue;
      
      const baseClasses = baseObjMatch[1].trim();
      if (!baseClasses) continue;
      
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
  }
  
  /**
   * Extracts variants from cva configurations
   */
  private static extractVariants(
    content: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig,
    classEntries: EnhancedClassEntry[]
  ): void {
    // Approach 1: Extract full variants object
    const variantsObjectPattern = /variants\s*:\s*({[\s\S]*?})\s*(?:,|$)/g;
    let variantsObjMatch;
    
    while ((variantsObjMatch = variantsObjectPattern.exec(content)) !== null) {
      if (!variantsObjMatch[1]) continue;
      
      const variantsObjectText = variantsObjMatch[1];
      this.processVariantsObject(variantsObjectText, componentName, componentDir, config, classEntries);
    }
    
    // Approach 2: Direct extraction of variant groups
    const variantGroupsPattern = /variants\s*:\s*{([\s\S]*?)}\s*(?:,|$)/g;
    let variantGroupsMatch;
    
    while ((variantGroupsMatch = variantGroupsPattern.exec(content)) !== null) {
      if (!variantGroupsMatch[1]) continue;
      
      const groupsText = variantGroupsMatch[1];
      
      // Extract individual variant groups
      const groupPattern = /(\w+)\s*:\s*{([\s\S]*?)}/g;
      let groupMatch;
      
      while ((groupMatch = groupPattern.exec(groupsText)) !== null) {
        if (!groupMatch[1] || !groupMatch[2]) continue;
        
        const groupName = groupMatch[1];
        const groupContent = groupMatch[2];
        
        // Extract individual variants in the group
        this.extractVariantValues(groupName, groupContent, componentName, componentDir, config, classEntries);
      }
    }
  }
  
  /**
   * Process a variants object and extract all variant classes
   */
  private static processVariantsObject(
    variantsObjectText: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig,
    classEntries: EnhancedClassEntry[]
  ): void {
    // Extract individual variant groups from the object
    const groupPattern = /(\w+)\s*:\s*{([\s\S]*?)}/g;
    let groupMatch;
    
    while ((groupMatch = groupPattern.exec(variantsObjectText)) !== null) {
      if (!groupMatch[1] || !groupMatch[2]) continue;
      
      const groupName = groupMatch[1];
      const groupContent = groupMatch[2];
      
      this.extractVariantValues(groupName, groupContent, componentName, componentDir, config, classEntries);
    }
  }
  
  /**
   * Extract individual variant values from a group
   */
  private static extractVariantValues(
    groupName: string,
    groupContent: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig,
    classEntries: EnhancedClassEntry[]
  ): void {
    // Pattern for variant: name: "classes"
    const variantPattern = /(\w+)\s*:\s*['"`](.*?)['"`]/g;
    let variantMatch;
    
    while ((variantMatch = variantPattern.exec(groupContent)) !== null) {
      if (!variantMatch[1] || !variantMatch[2]) continue;
      
      const variantName = variantMatch[1];
      const variantClasses = variantMatch[2].trim();
      
      if (!variantClasses) continue;
      
      const entry = createClassEntry(
        variantClasses,
        componentName,
        componentDir,
        `${groupName}-${variantName}`,
        { [groupName]: variantName },
        config
      );
      
      if (entry) classEntries.push(entry);
    }
    
    // Pattern for variant with array/spread: name: ["class1", "class2"]
    const arrayVariantPattern = /(\w+)\s*:\s*\[([\s\S]*?)\]/g;
    let arrayMatch;
    
    while ((arrayMatch = arrayVariantPattern.exec(groupContent)) !== null) {
      if (!arrayMatch[1] || !arrayMatch[2]) continue;
      
      const variantName = arrayMatch[1];
      const classArray = arrayMatch[2];
      
      // Extract each class string in the array
      const classStrings = classArray.match(/['"`](.*?)['"`]/g);
      if (!classStrings) continue;
      
      // Combine all classes into one string
      const combinedClasses = classStrings
        .map(str => str.slice(1, -1).trim())
        .filter(Boolean)
        .join(' ');
      
      if (!combinedClasses) continue;
      
      const entry = createClassEntry(
        combinedClasses,
        componentName,
        componentDir,
        `${groupName}-${variantName}`,
        { [groupName]: variantName },
        config
      );
      
      if (entry) classEntries.push(entry);
    }
  }
} 