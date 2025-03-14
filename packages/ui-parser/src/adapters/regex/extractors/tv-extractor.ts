import { EnhancedClassEntry, ClassNameConfig } from '../types';
import { createClassEntry } from '../utils/class-entry';

export class TailwindVariantsExtractor {
  static extract(
    content: string,
    componentName: string,
    componentDir: string,
    config: ClassNameConfig
  ): EnhancedClassEntry[] {
    const classEntries: EnhancedClassEntry[] = [];
    
    // Обновленный паттерн для поиска tv/cva конструкций
    const tvPattern = /(?:tv|cva)\(\s*\{([^}]+)\}\s*\)/g;
    let tvMatch;

    while ((tvMatch = tvPattern.exec(content)) !== null) {
      const tvContent = tvMatch[1];

      // Извлекаем базовые классы
      const baseClasses = this.extractBaseClasses(tvContent);
      if (baseClasses) {
        classEntries.push(
          createClassEntry(
            baseClasses,
            componentName,
            componentDir,
            'div', // или определять из контекста
            {},
            config
          )
        );
      }

      // Извлекаем варианты
      const variants = this.extractVariants(tvContent);
      for (const [variantGroup, variantValues] of Object.entries(variants)) {
        for (const [variantName, variantClasses] of Object.entries(variantValues)) {
          if (this.isValidClassString(variantClasses)) {
            classEntries.push(
              createClassEntry(
                variantClasses,
                componentName,
                componentDir,
                'div',
                { [variantGroup]: variantName },
                config
              )
            );
          }
        }
      }
    }

    return classEntries;
  }

  private static extractBaseClasses(content: string): string | null {
    const baseMatch = content.match(/base:\s*["'`]([^"'`]+)["'`]/);
    return baseMatch ? baseMatch[1].trim() : null;
  }

  private static extractVariants(content: string): Record<string, Record<string, string>> {
    const variants: Record<string, Record<string, string>> = {};
    const variantsMatch = content.match(/variants:\s*{([^}]+)}/);
    
    if (!variantsMatch) return variants;

    const variantsContent = variantsMatch[1];
    const variantGroups = variantsContent.split(/},\s*(?=\w+:)/);

    for (const group of variantGroups) {
      const [groupName, groupContent] = group.split(/:\s*{/);
      if (!groupName || !groupContent) continue;

      variants[groupName.trim()] = {};
      const variantValues = groupContent.match(/(\w+):\s*["'`]([^"'`]+)["'`]/g) || [];

      for (const value of variantValues) {
        const [name, classes] = value.split(/:\s*["'`]/);
        if (name && classes) {
          variants[groupName.trim()][name.trim()] = classes.replace(/["'`]$/, '').trim();
        }
      }
    }

    return variants;
  }

  private static isValidClassString(classes: string): boolean {
    if (!classes || typeof classes !== 'string') return false;
    
    // Проверяем на наличие недопустимых конструкций
    const invalidPatterns = [
      /^\s*{/,      // Начинается с {
      /}\s*$/,      // Заканчивается на }
      /:\s*{/,      // Содержит : {
      /variants:/,   // Содержит слово variants:
      /base:/       // Содержит слово base:
    ];

    return !invalidPatterns.some(pattern => pattern.test(classes));
  }
} 