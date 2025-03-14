export function isValidTailwindClass(className: string): boolean {
  if (!className || typeof className !== 'string') return false;

  // Недопустимые паттерны
  const invalidPatterns = [
    /^\s*{/,          // Начинается с {
    /}\s*$/,          // Заканчивается на }
    /:\s*{/,          // Содержит : {
    /variants:/,      // Содержит слово variants:
    /base:/,         // Содержит слово base:
    /defaultVariants:/, // Содержит defaultVariants
    /"[^"]*"/,       // Содержит строки в кавычках
    /'[^']*'/,       // Содержит строки в одинарных кавычках
    /`[^`]*`/        // Содержит строки в обратных кавычках
  ];

  // Проверяем на недопустимые паттерны
  if (invalidPatterns.some(pattern => pattern.test(className))) {
    return false;
  }

  // Базовая структура Tailwind класса
  const validClassPattern = /^[a-zA-Z0-9-_:\/]+$/;
  return validClassPattern.test(className);
}

export function normalizeClassString(classString: string): string {
  return classString
    .split(/\s+/)
    .filter(cls => isValidTailwindClass(cls))
    .sort()
    .join(' ');
} 