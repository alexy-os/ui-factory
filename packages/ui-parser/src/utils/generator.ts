import fs from 'fs';
import path from 'path';
import { configManager } from '../config';
import { EnhancedClassEntry, CSSGenerationResult, GenerationOptions } from '../types';

export class CSSGenerator {
  private static instance: CSSGenerator;
  private cachedResults: Map<string, EnhancedClassEntry[]> = new Map();
  private cachedCSS: Map<string, CSSGenerationResult> = new Map();
  
  private constructor() {}
  
  public static getInstance(): CSSGenerator {
    if (!CSSGenerator.instance) {
      CSSGenerator.instance = new CSSGenerator();
    }
    return CSSGenerator.instance;
  }
  
  private loadAnalysisResults(): EnhancedClassEntry[] {
    const domAnalysisPath = configManager.getPath('domAnalysisResults');
    
    if (this.cachedResults.has(domAnalysisPath)) {
      console.log(`Using cached analysis results for CSS generation`);
      return this.cachedResults.get(domAnalysisPath) || [];
    }
    
    try {
      if (fs.existsSync(domAnalysisPath)) {
        const jsonContent = fs.readFileSync(domAnalysisPath, 'utf-8');
        const results = JSON.parse(jsonContent);
        
        this.cachedResults.set(domAnalysisPath, results);
        
        return results;
      }
      return [];
    } catch (error) {
      console.error('Error loading analysis results:', error);
      return [];
    }
  }

  private generateCSS(entries: EnhancedClassEntry[]): CSSGenerationResult {
    const cacheKey = JSON.stringify(entries.map(e => e.classes).sort());
    
    if (this.cachedCSS.has(cacheKey)) {
      return this.cachedCSS.get(cacheKey)!;
    }
    
    let quarkCSS = '';
    let semanticCSS = '';
    
    entries.forEach(entry => {
      const classes = entry.classes.trim();
      
      if (entry.modifiers.length > 0) {
        entry.modifiers.forEach(mod => {
          quarkCSS += `.${mod.crypto} { @apply ${mod.classes}; }\n`;
          semanticCSS += `.${mod.semantic} { @apply ${mod.classes}; }\n`;
        });
      } else {
        quarkCSS += `.${entry.crypto} { @apply ${classes}; }\n`;
        semanticCSS += `.${entry.semantic} { @apply ${classes}; }\n`;
      }
    });

    const result = { quarkCSS, semanticCSS };
    this.cachedCSS.set(cacheKey, result);
    return result;
  }
  
  private saveCSS(css: CSSGenerationResult, outputDir: string): void {
    fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(outputDir, 'quark.css'), 
      css.quarkCSS
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'semantic.css'), 
      css.semanticCSS
    );
    
    console.log('CSS files generated successfully');
  }
  
  public generate(options: GenerationOptions = {}): CSSGenerationResult {
    const outputDir = options.outputPath || configManager.getPath('componentOutput');
    
    if (options.minify !== undefined || options.format !== undefined) {
      this.clearCaches();
    }
    
    try {
      const entries = this.loadAnalysisResults();
      
      if (entries.length === 0) {
        throw new Error('No class entries found for CSS generation');
      }
      
      const css = this.generateCSS(entries);
      
      this.saveCSS(css, outputDir);
      
      console.log(`✓ Generated CSS files:
  - quark.css (${css.quarkCSS.length} bytes)
  - semantic.css (${css.semanticCSS.length} bytes)`);
      
      return css;
    } catch (error) {
      console.error('Failed to generate CSS:', error);
      throw error;
    }
  }
  
  public clearCaches(): void {
    this.cachedResults.clear();
    this.cachedCSS.clear();
    console.log('CSS generator caches cleared');
  }
}

export const cssGenerator = CSSGenerator.getInstance();

export default cssGenerator; 