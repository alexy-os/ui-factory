import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

export class TailwindValidator {
  private validClassesCache = new Map<string, boolean>();

  /**
   * Проверяет массив классов на валидность Tailwind
   */
  async filterTailwindClasses(classes: string[]): Promise<string[]> {
    // Убираем дубликаты и пустые классы
    const uniqueClasses = [...new Set(classes.filter(Boolean))];
    
    // Проверяем кэш
    const uncachedClasses = uniqueClasses.filter(
      cls => !this.validClassesCache.has(cls)
    );

    if (uncachedClasses.length === 0) {
      return uniqueClasses.filter(cls => this.validClassesCache.get(cls));
    }

    // Создаем CSS для batch-проверки
    const css = uncachedClasses
      .map((cls, i) => `.test-${i} { @apply ${cls}; }`)
      .join('\n');

    try {
      await postcss([tailwindcss]).process(css);
      // Все классы валидны, обновляем кэш
      uncachedClasses.forEach(cls => this.validClassesCache.set(cls, true));
      return uniqueClasses;
    } catch (error) {
      // Парсим ошибку для определения невалидных классов
      const invalidClasses = new Set(
        String(error)
          .match(/`([^`]+)`/g)
          ?.map(m => m.replace(/`/g, '')) || []
      );

      // Обновляем кэш
      uncachedClasses.forEach(cls => {
        this.validClassesCache.set(cls, !invalidClasses.has(cls));
      });

      return uniqueClasses.filter(cls => !invalidClasses.has(cls));
    }
  }

  /**
   * Фильтрует строку классов
   */
  async filterClassString(classString: string): Promise<string> {
    const classes = classString.split(' ').filter(Boolean);
    const validClasses = await this.filterTailwindClasses(classes);
    return validClasses.join(' ');
  }
}

export const tailwindValidator = new TailwindValidator(); 