import { ClassExtractorAdapter } from './base-adapter';
import { DOMExtractorAdapter } from './dom-adapter';
import { RegexExtractorAdapter } from './regex-adapter';

/**
 * Фабрика адаптеров для извлечения классов
 */
export class AdapterFactory {
  private static instance: AdapterFactory;
  private adapters: ClassExtractorAdapter[] = [];
  
  private constructor() {
    // Регистрируем адаптеры
    this.registerAdapter(new DOMExtractorAdapter());
    this.registerAdapter(new RegexExtractorAdapter());
  }
  
  /**
   * Получение экземпляра AdapterFactory (Singleton)
   */
  public static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }
  
  /**
   * Регистрирует новый адаптер
   */
  public registerAdapter(adapter: ClassExtractorAdapter): void {
    this.adapters.push(adapter);
  }
  
  /**
   * Получает все зарегистрированные адаптеры
   */
  public getAdapters(): ClassExtractorAdapter[] {
    return this.adapters;
  }
  
  /**
   * Находит подходящий адаптер для компонента
   */
  public findAdapter(componentPath: string): ClassExtractorAdapter | null {
    // Сначала пробуем DOM адаптер, затем остальные
    for (const adapter of this.adapters) {
      if (adapter instanceof DOMExtractorAdapter && adapter.supportsComponent(componentPath)) {
        return adapter;
      }
    }
    
    // Если DOM адаптер не подходит, пробуем остальные
    for (const adapter of this.adapters) {
      if (!(adapter instanceof DOMExtractorAdapter) && adapter.supportsComponent(componentPath)) {
        return adapter;
      }
    }
    
    return null;
  }
}

// Экспортируем экземпляр для удобного использования
export const adapterFactory = AdapterFactory.getInstance();

// Экспортируем типы и классы
export type { ClassExtractorAdapter } from './base-adapter';
export { DOMExtractorAdapter } from './dom-adapter';
export { RegexExtractorAdapter } from './regex-adapter'; 