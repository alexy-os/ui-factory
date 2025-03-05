/**
 * Утилиты для работы с квантовыми классами
 */

import semver from 'semver';

export interface QuarkMetadata {
  name: string;           version: string;        deprecated?: boolean;   replacedBy?: string;    description?: string;   category?: string;      cssProperties?: string[]; }

export interface QuarkRegistry {
  [className: string]: QuarkMetadata;
}

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
            return Object.entries(criteria).every(([key, value]) => {
        const metaKey = key as keyof QuarkMetadata;
        
                if (metaKey === 'version' && typeof value === 'string') {
          return semver.satisfies(meta.version, value);
        }
        
                if (Array.isArray(meta[metaKey]) && Array.isArray(value)) {
          return (meta[metaKey] as any[]).some(item => value.includes(item));
        }
        
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
export function transformToQuark(utilityClasses: string): string {
      
    return utilityClasses;
} 