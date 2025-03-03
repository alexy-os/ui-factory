import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';
import { ClassEntry, CSSGenerationResult, GenerationOptions } from './types';

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
   * Загружает объект классов
   */
  public loadClassObject(): Record<string, ClassEntry> {
    try {
      if (fs.existsSync(CONFIG.paths.domAnalysisResults)) {
        const jsonContent = fs.readFileSync(CONFIG.paths.domAnalysisResults, 'utf-8');
        const results = JSON.parse(jsonContent);
        
        // Преобразуем массив в объект с ключами semantic
        const classObj: Record<string, ClassEntry> = {};
        results.forEach((entry: any) => {
          classObj[entry.semantic] = {
            quark: entry.quark,
            semantic: entry.semantic,
            classes: entry.classes,
            components: entry.components
          };
        });
        
        return classObj;
      }
      return {};
    } catch (error) {
      console.error('Error loading class data:', error);
      return {};
    }
  }
  
  /**
   * Генерирует CSS с семантическими и кварк классами
   */
  public generateCSS(classObject: Record<string, ClassEntry>): CSSGenerationResult {
    let quarkCSS = '';
    let semanticCSS = '';
    
    Object.values(classObject).forEach(entry => {
      quarkCSS += `.${entry.quark} { @apply ${entry.classes}; }\n`;
      semanticCSS += `.${entry.semantic} { @apply ${entry.classes}; }\n`;
    });
    
    return { quarkCSS, semanticCSS };
  }
  
  /**
   * Сохраняет сгенерированный CSS
   */
  public saveCSS(css: CSSGenerationResult, options: GenerationOptions = {}): void {
    const outputDir = path.dirname(CONFIG.paths.classObject);
    
    // Создаем директорию, если она не существует
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
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
   * Сохраняет объект классов в файл
   */
  public saveClassObject(classObject: Record<string, ClassEntry>): void {
    // Создаем директорию, если она не существует
    const outputDir = path.dirname(CONFIG.paths.classObject);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Сохраняем объект классов
    const fileContent = `// Generated class object mapping
// DO NOT EDIT MANUALLY

export const classObject = ${JSON.stringify(classObject, null, 2)};
`;
    fs.writeFileSync(CONFIG.paths.classObject, fileContent);
    
    console.log('Class object saved successfully');
  }
  
  /**
   * Генерирует CSS и сохраняет файлы
   */
  public generate(options: GenerationOptions = {}): CSSGenerationResult {
    // Загружаем объект классов
    const classObject = this.loadClassObject();
    
    // Генерируем CSS
    const css = this.generateCSS(classObject);
    
    // Сохраняем CSS
    this.saveCSS(css, options);
    
    // Сохраняем объект классов
    this.saveClassObject(classObject);
    
    return css;
  }
}

// Экспортируем экземпляр для удобного использования
export const cssGenerator = CSSGenerator.getInstance();

export default cssGenerator; 