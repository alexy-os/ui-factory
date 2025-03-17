import fs from 'fs';
import path from 'path';
import { configManager } from '../config';
import { componentAnalyzer } from '../utils/analyzer';
import { 
  EnhancedClassEntry,
  TransformationResult,
  ModifierEntry
} from '../types';

export interface ComponentTransformationOptions {
  sourceDir?: string;
  targetOutputDir?: string;
  transformationType?: 'semantic' | 'quark' | 'both';
  classEntries?: EnhancedClassEntry[];
}

export class ComponentTransformer {
  private static instance: ComponentTransformer;
  private cachedAnalysisData: EnhancedClassEntry[] | null = null;
  private cachedClassMap: Map<string, { semantic: string, crypto: string, modifiers?: ModifierEntry[] }> | null = null;
  private transformedComponents: Set<string> = new Set();
  
  private constructor() {}
  
  public static getInstance(): ComponentTransformer {
    if (!ComponentTransformer.instance) {
      ComponentTransformer.instance = new ComponentTransformer();
    }
    return ComponentTransformer.instance;
  }
  
  public transformComponents(options: ComponentTransformationOptions = {}): TransformationResult {
    const sourceDir = options.sourceDir || configManager.getPath('sourceDir');
    const targetOutputDir = options.targetOutputDir || configManager.getPath('componentOutput');
    const transformationType = options.transformationType || 'both';
    
    const components = componentAnalyzer.scanDirectory(sourceDir);
    
    let domAnalysisData: EnhancedClassEntry[] = options.classEntries || [];
    
    if (domAnalysisData.length === 0) {
      if (this.cachedAnalysisData !== null) {
        domAnalysisData = this.cachedAnalysisData;
      } else {
        try {
          const jsonContent = fs.readFileSync(configManager.getPath('domAnalysisResults'), 'utf-8');
          domAnalysisData = JSON.parse(jsonContent);
          
          this.cachedAnalysisData = domAnalysisData;
        } catch (error) {
          console.error('Error loading domAnalysis.json:', error);
          return {
            componentsTransformed: 0,
            classesReplaced: 0,
            errors: [{
              component: 'domAnalysis.json',
              error: error instanceof Error ? error.message : String(error)
            }]
          };
        }
      }
    }
    
    const classMap = this.getClassMap(domAnalysisData);
    
    //console.log(`Using class map with ${classMap.size} entries`);
    
    const result: TransformationResult = {
      componentsTransformed: 0,
      classesReplaced: 0,
      errors: []
    };
    
    for (const component of components) {
      const cacheKey = `${component.path}:${transformationType}:${targetOutputDir}`;
      if (this.transformedComponents.has(cacheKey) && !options.classEntries) {
        result.componentsTransformed++;
        continue;
      }
      
      //console.log(`Processing component: ${component.name}`);
      
      try {
        const content = fs.readFileSync(component.path, 'utf-8');
        
        let semanticContent = content;
        let quarkContent = content;
        
        const filePatterns = configManager.getPatternsForFile(component.path);
        
        if (!filePatterns) {
          console.warn(`No patterns found for file type: ${component.path}`);
          continue;
        }
        
        //console.log(`Using patterns for context type: ${filePatterns.contextType}`);
        
        const foundClasses: Array<{
          fullMatch: string;
          classValue: string;
          index: number;
        }> = [];
        
        for (const patternObj of filePatterns.patterns) {
          const regex = patternObj.pattern;
          let match;
          
          const patternRegex = new RegExp(regex.source, regex.flags);
          
          //console.log(`Applying pattern: ${patternObj.name} - ${patternRegex}`);
          
          while ((match = patternRegex.exec(content)) !== null) {
            if (match[1]) {
              foundClasses.push({
                fullMatch: match[0],
                classValue: match[1],
                index: match.index
              });
            }
          }
        }
        
        //console.log(`Found ${foundClasses.length} class declarations in ${component.name}`);
        
        foundClasses.sort((a, b) => b.index - a.index);
        
        for (const { fullMatch, classValue, index } of foundClasses) {
          if (classMap.has(classValue)) {
            const replacement = classMap.get(classValue)!;
            
            const attributeType = fullMatch.startsWith('class=') ? 'class' : 'className';
            
            if (transformationType === 'semantic' || transformationType === 'both') {
              semanticContent = 
                semanticContent.substring(0, index) + 
                `${attributeType}="${replacement.semantic}"` + 
                semanticContent.substring(index + fullMatch.length);
            }
            
            if (transformationType === 'quark' || transformationType === 'both') {
              quarkContent = 
                quarkContent.substring(0, index) + 
                `${attributeType}="${replacement.crypto}"` +
                quarkContent.substring(index + fullMatch.length);
            }
            
            if (replacement.modifiers && replacement.modifiers.length > 0) {
              //console.log(`Replaced "${classValue}" with modifiers:`);
              /*replacement.modifiers.forEach(mod => {
                //console.log(`  - ${mod.type}: "${mod.name}" (${mod.classes})`);
              });*/
            } else {
              //console.log(`Replaced "${classValue}" with semantic: "${replacement.semantic}" and crypto: "${replacement.crypto}"`);
            }
            
            result.classesReplaced++;
            continue;
          }
          
          const normalizedClassValue = this.normalizeClassString(classValue);
          if (classMap.has(normalizedClassValue)) {
            const replacement = classMap.get(normalizedClassValue)!;
            
            const attributeType = fullMatch.startsWith('class=') ? 'class' : 'className';
            
            if (transformationType === 'semantic' || transformationType === 'both') {
              semanticContent = 
                semanticContent.substring(0, index) + 
                `${attributeType}="${replacement.semantic}"` + 
                semanticContent.substring(index + fullMatch.length);
            }
            
            if (transformationType === 'quark' || transformationType === 'both') {
              quarkContent = 
                quarkContent.substring(0, index) + 
                `${attributeType}="${replacement.crypto}"` +
                quarkContent.substring(index + fullMatch.length);
            }
            
            result.classesReplaced++;
            //console.log(`Replaced normalized "${normalizedClassValue}" with semantic: "${replacement.semantic}" and crypto: "${replacement.crypto}"`);
            continue;
          }
          
          //console.log(`No replacement found for "${classValue}"`);
        }
        
        const outputPath = path.join(targetOutputDir, component.relativePath);
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const baseName = path.basename(outputPath, path.extname(outputPath));
        const extension = path.extname(outputPath);
        
        if (transformationType === 'semantic' || transformationType === 'both') {
          const semanticOutputPath = path.join(outputDir, `${baseName}.semantic${extension}`);
          fs.writeFileSync(semanticOutputPath, semanticContent);
        }
        
        if (transformationType === 'quark' || transformationType === 'both') {
          const cryptoOutputPath = path.join(outputDir, `${baseName}.crypto${extension}`);
          fs.writeFileSync(cryptoOutputPath, quarkContent);
        }
        
        this.transformedComponents.add(cacheKey);
        
        result.componentsTransformed++;
        //console.log(`Transformed component ${component.name} saved`);
      } catch (error) {
        console.error(`Error transforming component ${component.name}:`, error);
        result.errors.push({
          component: component.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return result;
  }
  
  private getClassMap(domAnalysisData: EnhancedClassEntry[]): Map<string, { 
    semantic: string, 
    crypto: string,
    modifiers?: ModifierEntry[]
  }> {
    if (this.cachedClassMap !== null) {
      return this.cachedClassMap;
    }
    
    const classMap = new Map<string, { 
      semantic: string, 
      crypto: string,
      modifiers?: ModifierEntry[]
    }>();
    
    domAnalysisData.forEach(entry => {
      if (entry.modifiers.length > 0) {
        const modSemanticClasses = entry.modifiers.map(m => m.semantic).join(' ');
        const modCryptoClasses = entry.modifiers.map(m => m.crypto).join(' ');
        
        classMap.set(entry.classes, {
          semantic: modSemanticClasses,
          crypto: modCryptoClasses,
          modifiers: entry.modifiers
        });
      } else {
        classMap.set(entry.classes, {
          semantic: entry.semantic,
          crypto: entry.crypto
        });
      }
      
      const normalizedClasses = this.normalizeClassString(entry.classes);
      if (normalizedClasses !== entry.classes) {
        if (entry.modifiers.length > 0) {
          const modSemanticClasses = entry.modifiers.map(m => m.semantic).join(' ');
          const modCryptoClasses = entry.modifiers.map(m => m.crypto).join(' ');
          
          classMap.set(normalizedClasses, {
            semantic: modSemanticClasses,
            crypto: modCryptoClasses,
            modifiers: entry.modifiers
          });
        } else {
          classMap.set(normalizedClasses, {
            semantic: entry.semantic,
            crypto: entry.crypto
          });
        }
      }
    });
    
    this.cachedClassMap = classMap;
    
    return classMap;
  }
  
  public clearCaches(): void {
    this.cachedAnalysisData = null;
    this.cachedClassMap = null;
    this.transformedComponents.clear();
    //console.log('Transformer caches cleared');
  }
  
  private normalizeClassString(classString: string): string {
    return classString.split(' ').sort().join(' ');
  }
}

export const componentTransformer = ComponentTransformer.getInstance();

export default componentTransformer; 