import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from '../core/types';

interface DirectReplacerOptions {
  sourceFile: string;
  quarkOutput: string;
  semanticOutput: string;
  classEntries: EnhancedClassEntry[];
}

export class DirectReplacer {
  private classMap: Map<string, { quark: string; semantic: string }>;

  constructor(classEntries: EnhancedClassEntry[]) {
    // Создаем карту соответствий классов
    this.classMap = new Map(
      classEntries.map(entry => [
        entry.classes,
        { quark: entry.quark, semantic: entry.semantic }
      ])
    );
  }

  /**
   * Заменяет прямые вхождения классов в файле
   */
  private replaceClassesInContent(content: string, useQuark: boolean): string {
    let updatedContent = content;
    
    // Сортируем классы по длине (от самых длинных к коротким)
    const sortedEntries = Array.from(this.classMap.entries())
      .sort((a, b) => b[0].length - a[0].length);

    for (const [originalClasses, { quark, semantic }] of sortedEntries) {
      // Экранируем специальные символы в строке поиска
      const escapedClasses = originalClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Создаем паттерны для различных контекстов
      const patterns = [
        // JSX className
        new RegExp(`className=["']${escapedClasses}["']`, 'g'),
        // Объект с className
        new RegExp(`className:\\s*["']${escapedClasses}["']`, 'g'),
        // Другие возможные контексты с className
        new RegExp(`className:\\s*['"\`]${escapedClasses}['"\`]`, 'g'),
        // Общий случай для строк с классами
        new RegExp(`["']${escapedClasses}["']`, 'g')
      ];

      const replacement = useQuark ? quark : semantic;

      // Применяем каждый паттерн
      patterns.forEach(pattern => {
        updatedContent = updatedContent.replace(pattern, (match) => {
          // Сохраняем оригинальные кавычки
          const quoteMatch = match.match(/['"`]/);
          const quote = quoteMatch ? quoteMatch[0] : '"';
          
          // Если это JSX атрибут
          if (match.startsWith('className=')) {
            return `className=${quote}${replacement}${quote}`;
          }
          // Если это объявление в объекте
          if (match.startsWith('className:')) {
            return `className: ${quote}${replacement}${quote}`;
          }
          // Для остальных случаев
          return `${quote}${replacement}${quote}`;
        });
      });
    }

    return updatedContent;
  }

  /**
   * Применяет замены к файлам
   */
  public async transform({ sourceFile, quarkOutput, semanticOutput }: DirectReplacerOptions): Promise<void> {
    console.log('\n=== Starting direct replacement process ===');
    
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`);
    }
    console.log('✓ Source file verified');

    try {
      // Создаем директории если их нет
      console.log('\nPreparing output directories...');
      fs.mkdirSync(path.dirname(quarkOutput), { recursive: true });
      fs.mkdirSync(path.dirname(semanticOutput), { recursive: true });
      console.log('✓ Directories prepared');

      // Копируем исходный файл
      console.log('\nCopying source file to outputs...');
      fs.copyFileSync(sourceFile, quarkOutput);
      fs.copyFileSync(sourceFile, semanticOutput);
      console.log('✓ Files copied');

      // Выполняем замены
      console.log('\nPerforming replacements...');
      let quarkContent = fs.readFileSync(quarkOutput, 'utf-8');
      let semanticContent = fs.readFileSync(semanticOutput, 'utf-8');

      console.log('Applying quark replacements...');
      quarkContent = this.replaceClassesInContent(quarkContent, true);
      
      console.log('Applying semantic replacements...');
      semanticContent = this.replaceClassesInContent(semanticContent, false);

      // Записываем результаты
      console.log('\nSaving transformed files...');
      fs.writeFileSync(quarkOutput, quarkContent, 'utf-8');
      fs.writeFileSync(semanticOutput, semanticContent, 'utf-8');
      console.log('✓ Files saved');

      // Проверяем результаты
      console.log('\nVerifying replacements...');
      this.logReplacements(quarkContent, semanticContent);
      
      console.log('\n=== Direct replacement completed successfully ===');

    } catch (error) {
      console.error('\n❌ Error during direct replacement:');
      console.error(error);
      throw error;
    }
  }

  /**
   * Логирует выполненные замены для отладки
   */
  private logReplacements(quarkContent: string, semanticContent: string) {
    console.log('\nReplacement verification:');
    this.classMap.forEach(({ quark, semantic }, original) => {
      const quarkFound = quarkContent.includes(quark);
      const semanticFound = semanticContent.includes(semantic);
      
      console.log(`\nOriginal: "${original}"`);
      console.log(`Quark   : "${quark}" ${quarkFound ? '✓' : '✗'}`);
      console.log(`Semantic: "${semantic}" ${semanticFound ? '✓' : '✗'}`);
    });
  }
} 