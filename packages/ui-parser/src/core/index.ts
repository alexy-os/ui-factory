import { componentAnalyzer } from './analyzer.js';
import { cssGenerator } from './generator.js';
import { componentTransformer } from './transformer.js';

export * from './types.js';
export { componentAnalyzer, cssGenerator, componentTransformer };

/**
 * Основной класс UI Parser
 */
export class UIParser {
  private static instance: UIParser;
  
  private constructor() {}
  
  /**
   * Получение экземпляра UIParser (Singleton)
   */
  public static getInstance(): UIParser {
    if (!UIParser.instance) {
      UIParser.instance = new UIParser();
    }
    return UIParser.instance;
  }
  
  /**
   * Анализирует компоненты
   */
  public async analyze(options = {}) {
    return componentAnalyzer.analyzeAllComponents(options);
  }
  
  /**
   * Генерирует CSS
   */
  public generate(options = {}) {
    return cssGenerator.generate(options);
  }
  
  /**
   * Трансформирует компоненты
   */
  public transform(options = {}) {
    return componentTransformer.transformComponents(options);
  }
  
  /**
   * Выполняет все операции последовательно
   */
  public async all(options = {}) {
    console.log('Starting UI Parser all operations...');
    
    // Анализ
    console.log('Step 1: Analyzing components...');
    await this.analyze(options);
    
    // Генерация
    console.log('Step 2: Generating CSS...');
    this.generate(options);
    
    // Трансформация
    console.log('Step 3: Transforming components...');
    this.transform(options);
    
    console.log('All operations completed successfully!');
  }
}

// Экспортируем экземпляр для удобного использования
export const uiParser = UIParser.getInstance();

export default uiParser; 