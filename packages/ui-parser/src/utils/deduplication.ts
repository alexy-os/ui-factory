import { EnhancedClassEntry } from '../core/types';

/**
 * Удаляет дубликаты записей по полю quark
 */
export function deduplicateEntries(entries: EnhancedClassEntry[]): EnhancedClassEntry[] {
  const quarkMap = new Map<string, EnhancedClassEntry>();
  
  entries.forEach(entry => {
    const existingEntry = quarkMap.get(entry.quark);
    
    if (!existingEntry) {
            quarkMap.set(entry.quark, entry);
    } else {
            existingEntry.components = {
        ...existingEntry.components,
        ...entry.components
      };
    }
  });
  
  return Array.from(quarkMap.values());
} 