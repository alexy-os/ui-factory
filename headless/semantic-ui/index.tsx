import React from 'react';
import { createRoot } from 'react-dom/client';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Предварительно загруженная карта классов (будет заполнена при сборке)
// В реальном приложении это будет импортироваться из JSON файла
const defaultClassMap: Record<string, string> = {
  "div-flex-gap-4-flex-col": "hero-content",
  "div-grid-grid-cols-2-gap-8": "hero-grid",
  "div-flex-justify-center": "hero-badge-wrapper",
  "h2-max-w-2xl-text-3xl-md-text-4xl-lg-text-5xl-font-bold": "hero-title",
  "p-text-base-text-muted-foreground-max-w-2xl": "hero-description",
  "div-flex-flex-col-md-flex-row-gap-4": "hero-buttons",
  "section-w-full-py-16-lg-py-32": "hero-section",
  "div-container-mx-auto-px-4-md-px-6-lg-px-8": "hero-container",
  "div-grid-grid-cols-1-md-grid-cols-2-items-center-gap-8": "hero-layout"
};

// Функция нормализации классов
const normalizeClassName = (tag: string, ...classes: string[]) => {
  // Удаляем конфликты и дублирующиеся классы
  const merged = twMerge(clsx(classes));

  // Разделяем модификаторы (sm:, lg:, hover:) и базовые классы
  const modifiers: string[] = [];
  const baseClasses: string[] = [];

  merged.split(" ").forEach((cls) => {
    if (cls.includes(":")) {
      modifiers.push(cls.replace(":", "-")); // Преобразуем `sm:grid-cols-2` → `sm-grid-cols-2`
    } else {
      baseClasses.push(cls);
    }
  });

  // Сортируем и объединяем (предсказуемый порядок ключа)
  const sortedBase = baseClasses.sort().join("-");
  const sortedModifiers = modifiers.sort().join("-");
  const key = `${tag}-${sortedBase}${sortedModifiers ? "-" + sortedModifiers : ""}`;

  // Проверяем в карте и возвращаем понятное имя
  return defaultClassMap[key] || key; // Если нет замены — оставляем ключ
};

// Пример классов из HeroSplit для демонстрации
const heroSplitClasses = [
  { tag: 'section', classes: 'w-full py-16 lg:py-32' },
  { tag: 'div', classes: 'container mx-auto px-4 md:px-6 lg:px-8' },
  { tag: 'div', classes: 'grid grid-cols-1 md:grid-cols-2 items-center gap-8' },
  { tag: 'div', classes: 'flex gap-4 flex-col' },
  { tag: 'div', classes: 'flex justify-center' },
  { tag: 'h2', classes: 'max-w-2xl text-3xl md:text-4xl lg:text-5xl font-bold' },
  { tag: 'p', classes: 'text-base text-muted-foreground max-w-2xl' },
  { tag: 'div', classes: 'flex flex-col md:flex-row gap-4' },
  { tag: 'div', classes: 'grid grid-cols-2 gap-8' }
];

// Функция для генерации CSS с @apply
const generateCSS = () => {
  let css = '';
  
  Object.entries(defaultClassMap).forEach(([key, classes]) => {
    // Если ключ уже семантический (не содержит исходный ключ), используем его
    const className = key.includes('-') ? key : classes;
    css += `.${className} { @apply ${classes}; }\n`;
  });
  
  return css;
};

// Основная функция приложения
const App = () => {
  const [css, setCss] = React.useState('');
  
  React.useEffect(() => {
    // Генерируем CSS
    const generatedCSS = generateCSS();
    setCss(generatedCSS);
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Semantic UI Generator</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Classes from HeroSplit.tsx</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          {heroSplitClasses.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="font-mono bg-gray-200 px-2 py-1 rounded mr-2">{item.tag}</span>
              <span className="font-mono">{item.classes}</span>
              <span className="ml-4 text-green-600">→</span>
              <span className="ml-2 font-mono font-bold">{normalizeClassName(item.tag, item.classes)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Generated CSS</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm">
          {css}
        </pre>
      </div>
    </div>
  );
};

// Рендерим приложение
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} 