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
    // Сначала создаем массив записей и сортируем его
    const sortedEntries = classEntries
      .map(entry => ({
        original: entry.classes,
        quark: entry.quark,
        semantic: entry.semantic
      }))
      .sort((a, b) => b.original.length - a.original.length);

    // Создаем Map из отсортированного массива
    this.classMap = new Map(
      sortedEntries.map(entry => [
        entry.original,
        { quark: entry.quark, semantic: entry.semantic }
      ])
    );

    console.log(`Created class map with ${this.classMap.size} entries`);
  }

  /**
   * Рекурсивно заменяет все вхождения классов в контенте
   */
  private replaceClassesInContent(content: string, useQuark: boolean): string {
    let result = content;
    let replacementMade = false;

    do {
      replacementMade = false;
      for (const [originalClasses, { quark, semantic }] of this.classMap) {
        const replacement = useQuark ? quark : semantic;
        
        // Экранируем спецсимволы для безопасного поиска
        const escapedClasses = originalClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Ищем вхождения с разными типами кавычек
        const searchRegex = new RegExp(`(['"\`])${escapedClasses}\\1`, 'g');
        
        // Проверяем, есть ли что заменять
        if (searchRegex.test(result)) {
          // Делаем замену с сохранением оригинального типа кавычек
          result = result.replace(searchRegex, (match, quote) => `${quote}${replacement}${quote}`);
          replacementMade = true;
          
          console.log(`Replaced: "${originalClasses}" → "${replacement}"`);
        }
      }
    } while (replacementMade); // Продолжаем, пока есть замены

    return result;
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

      // Читаем исходный файл
      const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

      // Выполняем замены
      console.log('\nPerforming replacements...');
      
      console.log('Applying quark replacements...');
      const quarkContent = this.replaceClassesInContent(sourceContent, true);
      
      console.log('Applying semantic replacements...');
      const semanticContent = this.replaceClassesInContent(sourceContent, false);

      // Записываем результаты
      console.log('\nSaving transformed files...');
      fs.writeFileSync(quarkOutput, quarkContent, 'utf-8');
      fs.writeFileSync(semanticOutput, semanticContent, 'utf-8');
      console.log('✓ Files saved');

      // Проверяем результаты
      console.log('\nVerifying replacements...');
      this.verifyReplacements(quarkContent, semanticContent);
      
      console.log('\n=== Direct replacement completed successfully ===');

    } catch (error) {
      console.error('\n❌ Error during direct replacement:');
      console.error(error);
      throw error;
    }
  }

  /**
   * Проверяет корректность замен
   */
  private verifyReplacements(quarkContent: string, semanticContent: string) {
    let totalReplacements = 0;
    let successfulReplacements = 0;

    this.classMap.forEach(({ quark, semantic }, original) => {
      totalReplacements += 2; // По одной замене для quark и semantic версий

      const quarkCount = (quarkContent.match(new RegExp(quark, 'g')) || []).length;
      const semanticCount = (semanticContent.match(new RegExp(semantic, 'g')) || []).length;
      const originalInQuark = (quarkContent.match(new RegExp(original, 'g')) || []).length;
      const originalInSemantic = (semanticContent.match(new RegExp(original, 'g')) || []).length;

      if (quarkCount > 0) successfulReplacements++;
      if (semanticCount > 0) successfulReplacements++;

      // Логируем результаты для каждого набора классов
      console.log(`\nVerifying replacements for "${original}":
        Quark: ${quarkCount} occurrences of "${quark}"
        Semantic: ${semanticCount} occurrences of "${semantic}"
        Original remaining in quark: ${originalInQuark}
        Original remaining in semantic: ${originalInSemantic}`);

      // Предупреждаем если оригинальные классы остались
      if (originalInQuark > 0 || originalInSemantic > 0) {
        console.warn(`⚠️ Warning: Original classes "${original}" still present in output files`);
      }
    });

    // Выводим общую статистику
    const successRate = (successfulReplacements / totalReplacements) * 100;
    console.log(`\nReplacement statistics:
      Total replacements attempted: ${totalReplacements}
      Successful replacements: ${successfulReplacements}
      Success rate: ${successRate.toFixed(2)}%`);

    if (successRate < 100) {
      console.warn('⚠️ Warning: Some replacements may have been missed');
    } else {
      console.log('✓ All replacements verified successfully');
    }
  }
}