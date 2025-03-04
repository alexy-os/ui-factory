import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';
import { EnhancedClassEntry, CSSGenerationResult, GenerationOptions } from './types';

/**
 * Класс для генерации CSS
 */
export class CSSGenerator {
  private static instance: CSSGenerator;
  
  private constructor() {}
  
  /**
   * Получение экземпляра CSSGenerator (Singleton)
   */
  public static getInstance(): CSSGenerator {
    if (!CSSGenerator.instance) {
      CSSGenerator.instance = new CSSGenerator();
    }
    return CSSGenerator.instance;
  }
  
  /**
   * Загружает результаты анализа
   */
  private loadAnalysisResults(): EnhancedClassEntry[] {
    try {
      if (fs.existsSync(CONFIG.paths.domAnalysisResults)) {
        const jsonContent = fs.readFileSync(CONFIG.paths.domAnalysisResults, 'utf-8');
        return JSON.parse(jsonContent);
      }
      return [];
    } catch (error) {
      console.error('Error loading analysis results:', error);
      return [];
    }
  }
  
  /**
   * Генерирует CSS с семантическими и кварк классами
   */
  private generateCSS(entries: EnhancedClassEntry[]): CSSGenerationResult {
    let quarkCSS = '';
    let semanticCSS = '';
    
    entries.forEach(entry => {
      quarkCSS += `.${entry.quark} { @apply ${entry.classes}; }\n`;
      semanticCSS += `.${entry.semantic} { @apply ${entry.classes}; }\n`;
    });
    
    return { quarkCSS, semanticCSS };
  }
  
  /**
   * Сохраняет сгенерированный CSS
   */
  private saveCSS(css: CSSGenerationResult, outputDir: string): void {
    // Создаем директорию, если она не существует
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Сохраняем CSS файлы
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
  
  /**
   * Генерирует CSS и сохраняет файлы
   */
  public generate(options: GenerationOptions = {}): CSSGenerationResult {
    const outputDir = options.outputPath || CONFIG.paths.componentOutput;
    
    try {
      // Загружаем результаты анализа
      const entries = this.loadAnalysisResults();
      
      if (entries.length === 0) {
        throw new Error('No class entries found for CSS generation');
      }
      
      // Генерируем CSS
      const css = this.generateCSS(entries);
      
      // Сохраняем CSS
      this.saveCSS(css, outputDir);
      
      // Логируем только итоговый результат
      console.log(`✓ Generated CSS files:
  - quark.css (${css.quarkCSS.length} bytes)
  - semantic.css (${css.semanticCSS.length} bytes)`);
      
      return css;
    } catch (error) {
      console.error('❌ CSS generation failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
}

// Экспортируем экземпляр для удобного использования
export const cssGenerator = CSSGenerator.getInstance();

export default cssGenerator; 