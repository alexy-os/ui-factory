/**
 * Утилиты для работы с квантовыми классами
 */

import semver from 'semver';

// Тип для мета-информации о квантовом классе
export interface QuarkMetadata {
  name: string;         // Имя квантового класса
  version: string;      // Версия семантики (semver)
  deprecated?: boolean; // Флаг устаревшего класса
  replacedBy?: string;  // На какой класс заменить
  description?: string; // Описание класса
  category?: string;    // Категория (layout, typography и т.д.)
  cssProperties?: string[]; // CSS свойства, которые изменяет класс
}

// Интерфейс для записей о квантовых классах
export interface QuarkRegistry {
  [className: string]: QuarkMetadata;
}

// Хранилище метаданных о квантовых классах
let quarkRegistry: QuarkRegistry = {};

/**
 * Регистрация квантового класса
 */
export function registerQuark(className: string, metadata: QuarkMetadata): void {
  quarkRegistry[className] = { ...metadata };
}

/**
 * Регистрация нескольких квантовых классов
 */
export function registerQuarks(quarks: Record<string, QuarkMetadata>): void {
  quarkRegistry = { ...quarkRegistry, ...quarks };
}

/**
 * Получение метаданных о квантовом классе
 */
export function getQuarkMetadata(className: string): QuarkMetadata | null {
  return quarkRegistry[className] || null;
}

/**
 * Поиск квантового класса по критериям
 */
export function findQuarks(criteria: Partial<QuarkMetadata>): string[] {
  return Object.entries(quarkRegistry)
    .filter(([_, meta]) => {
      // Проверяем каждое свойство из критериев поиска
      return Object.entries(criteria).every(([key, value]) => {
        const metaKey = key as keyof QuarkMetadata;
        
        // Для версии используем semver
        if (metaKey === 'version' && typeof value === 'string') {
          return semver.satisfies(meta.version, value);
        }
        
        // Для массивов проверяем пересечение
        if (Array.isArray(meta[metaKey]) && Array.isArray(value)) {
          return (meta[metaKey] as any[]).some(item => value.includes(item));
        }
        
        // Для остальных полей - простое сравнение
        return meta[metaKey] === value;
      });
    })
    .map(([className]) => className);
}

/**
 * Получение актуальной версии квантового класса
 * (если класс устарел, возвращает замену)
 */
export function getLatestQuarkVersion(className: string): string {
  const metadata = getQuarkMetadata(className);
  
  if (!metadata) return className;
  
  // Если класс устарел и есть замена, возвращаем её
  if (metadata.deprecated && metadata.replacedBy) {
    return getLatestQuarkVersion(metadata.replacedBy);
  }
  
  return className;
}

/**
 * Обновление квантовых классов в строке с учетом их актуальности
 */
export function updateQuarkClasses(classNames: string): string {
  if (!classNames) return '';
  
  return classNames
    .split(/\s+/)
    .filter(Boolean)
    .map(className => getLatestQuarkVersion(className))
    .join(' ');
}

/**
 * Преобразование классов по уровню семантики (от утилитарных к квантовым)
 */
export function transformToQuark(utilityClasses: string, targetVersion?: string): string {
  // Здесь должна быть логика преобразования из utilityClasses в quarkClasses
  // На основе вашего classObject
  
  // Заглушка для примера
  return utilityClasses;
} 