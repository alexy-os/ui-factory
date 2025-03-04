import { EnhancedClassEntry } from '../core/types';

/**
 * Удаляет дубликаты записей по полю quark
 */
export function deduplicateEntries(entries: EnhancedClassEntry[]): EnhancedClassEntry[] {
  const quarkMap = new Map<string, EnhancedClassEntry>();
  
  entries.forEach(entry => {
    const existingEntry = quarkMap.get(entry.quark);
    
    if (!existingEntry) {
      // Если записи нет, добавляем новую
      quarkMap.set(entry.quark, entry);
    } else {
      // Если запись существует, объединяем компоненты
      existingEntry.components = {
        ...existingEntry.components,
        ...entry.components
      };
    }
  });
  
  return Array.from(quarkMap.values());
} 