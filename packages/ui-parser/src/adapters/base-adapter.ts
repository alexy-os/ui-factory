import { EnhancedClassEntry } from '../core/types';

/**
 * Базовый интерфейс для адаптеров извлечения классов
 */
export interface ClassExtractorAdapter {
  /**
   * Название адаптера
   */
  readonly name: string;
  
  /**
   * Анализирует компонент и извлекает классы
   * @param componentPath Путь к компоненту
   * @returns Массив записей о классах
   */
  extractClasses(componentPath: string): Promise<EnhancedClassEntry[]>;
  
  /**
   * Проверяет, поддерживает ли адаптер данный компонент
   * @param componentPath Путь к компоненту
   * @returns true, если адаптер поддерживает компонент
   */
  supportsComponent(componentPath: string): boolean;
} 