import { ClassExtractorAdapter } from './base-adapter';
import { DOMExtractorAdapter } from './dom-adapter';
import { RegexExtractorAdapter } from './regex';
import { configManager } from '../config';

/**
 * Фабрика адаптеров для извлечения классов
 */
export class AdapterFactory {
  private static instance: AdapterFactory;
  private adapters: Map<string, ClassExtractorAdapter> = new Map();
  
  private constructor() {
    // Регистрируем адаптеры
    this.registerAdapter('dom', new DOMExtractorAdapter());
    this.registerAdapter('regex', new RegexExtractorAdapter());
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
  public registerAdapter(type: string, adapter: ClassExtractorAdapter): void {
    this.adapters.set(type, adapter);
  }
  
  /**
   * Получает все зарегистрированные адаптеры
   */
  public getAdapters(): ClassExtractorAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Находит подходящий адаптер для компонента
   */
  public findAdapter(componentPath: string): ClassExtractorAdapter | null {
    // Получаем предпочтительный тип экстрактора из конфигурации
    const preferredType = configManager.getExtractor();
    
    // Пробуем использовать предпочтительный экстрактор
    const preferredAdapter = this.adapters.get(preferredType);
    if (preferredAdapter?.supportsComponent(componentPath)) {
      return preferredAdapter;
    }
    
    // Если предпочтительный экстрактор не подходит, пробуем другие
    for (const [type, adapter] of this.adapters.entries()) {
      if (type !== preferredType && adapter.supportsComponent(componentPath)) {
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
export { RegexExtractorAdapter } from './regex'; 