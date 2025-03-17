import fs from 'fs';
import path from 'path';
import { configManager } from '../config';
import { EnhancedClassEntry, ModifierEntry } from '../types';

export interface DirectReplacerOptions {
  sourceFile: string;
  quarkOutput: string;
  semanticOutput: string;
  classEntries?: EnhancedClassEntry[];
  transformationType?: 'semantic' | 'quark' | 'both';
}

export class DirectReplacer {
  private classMap: Map<string, {
    semantic: string;
    crypto: string;
  }>;

  constructor(classEntries: EnhancedClassEntry[]) {
    this.classMap = new Map();

    // Создаем плоскую карту замен
    classEntries.forEach(entry => {
      if (entry.classes) {
        // Основные классы
        this.classMap.set(entry.classes, {
          semantic: entry.semantic,
          crypto: entry.crypto
        });

        // Модификаторы
        if (Array.isArray(entry.modifiers)) {
          entry.modifiers.forEach(mod => {
            if (mod.classes) {
              this.classMap.set(mod.classes, {
                semantic: mod.semantic,
                crypto: mod.crypto
              });
            }
          });
        }
      }
    });
  }

  public async transform(options: DirectReplacerOptions): Promise<void> {
    const { sourceFile, quarkOutput, semanticOutput } = options;

    try {
      let content = fs.readFileSync(sourceFile, 'utf-8');
      let semanticContent = content;
      let cryptoContent = content;

      // Сортируем классы по длине (длинные первыми)
      const classStrings = Array.from(this.classMap.keys())
        .sort((a, b) => b.length - a.length);

      // Простая замена строк
      for (const classString of classStrings) {
        const replacement = this.classMap.get(classString);
        if (replacement) {
          // Заменяем все вхождения оригинальных классов на semantic/crypto
          semanticContent = semanticContent.replace(
            new RegExp(this.escapeRegExp(classString), 'g'),
            replacement.semantic
          );
          
          cryptoContent = cryptoContent.replace(
            new RegExp(this.escapeRegExp(classString), 'g'),
            replacement.crypto
          );
        }
      }

      // Сохраняем результаты
      fs.mkdirSync(path.dirname(semanticOutput), { recursive: true });
      fs.mkdirSync(path.dirname(quarkOutput), { recursive: true });
      
      fs.writeFileSync(semanticOutput, semanticContent);
      fs.writeFileSync(quarkOutput, cryptoContent);

    } catch (error) {
      console.error('Error during direct replacement:', error);
      throw error;
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public supportsFile(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    return configManager.isFileSupported(filePath);
  }
}