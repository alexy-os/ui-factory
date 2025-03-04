import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from '../core/types';

interface DirectReplacerOptions {
  sourceFile: string;
  quarkOutput: string;
  semanticOutput: string;
  classEntries: EnhancedClassEntry[];
}

interface ReplacementResult {
  result: string;
  replacementCount: number;
}

export class DirectReplacer {
  private classMap: Map<string, { quark: string; semantic: string }>;

  constructor(classEntries: EnhancedClassEntry[]) {
    const sortedEntries = classEntries
      .map(entry => ({
        original: entry.classes,
        quark: entry.quark,
        semantic: entry.semantic
      }))
      .sort((a, b) => b.original.length - a.original.length);

    this.classMap = new Map(
      sortedEntries.map(entry => [
        entry.original,
        { quark: entry.quark, semantic: entry.semantic }
      ])
    );
  }

  private replaceClassesInContent(content: string, useQuark: boolean): ReplacementResult {
    let result = content;
    let replacementCount = 0;

    for (const [originalClasses, { quark, semantic }] of this.classMap) {
      const replacement = useQuark ? quark : semantic;
      const escapedClasses = originalClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(`(['"\`])${escapedClasses}\\1`, 'g');
      
      result = result.replace(searchRegex, (match, quote) => {
        replacementCount++;
        return `${quote}${replacement}${quote}`;
      });
    }

    return { result, replacementCount };
  }

  public async transform({ sourceFile, quarkOutput, semanticOutput }: DirectReplacerOptions): Promise<void> {
    try {
      if (!fs.existsSync(sourceFile)) {
        throw new Error(`Source file not found: ${sourceFile}`);
      }

      // Создаем директории
      fs.mkdirSync(path.dirname(quarkOutput), { recursive: true });
      fs.mkdirSync(path.dirname(semanticOutput), { recursive: true });

      // Читаем исходный файл
      const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

      // Выполняем замены
      const quarkResult = this.replaceClassesInContent(sourceContent, true);
      const semanticResult = this.replaceClassesInContent(sourceContent, false);

      // Сохраняем результаты
      fs.writeFileSync(quarkOutput, quarkResult.result, 'utf-8');
      fs.writeFileSync(semanticOutput, semanticResult.result, 'utf-8');

      // Логируем только итоговый результат
      console.log(`✓ Transformed component:
  - Quark replacements: ${quarkResult.replacementCount}
  - Semantic replacements: ${semanticResult.replacementCount}`);

    } catch (error) {
      console.error('❌ Transformation failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
}