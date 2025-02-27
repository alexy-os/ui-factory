#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Конфигурация
const CONFIG = {
  // Пути к файлам и директориям
  paths: {
    classMap: path.resolve('./headless/semantic-ui/classMap.json'),
    resultDir: path.resolve('./headless/semantic-ui/result'),
    cssOutput: path.resolve('./headless/semantic-ui/semantic.css'),
  },
  
  // Компоненты для анализа
  components: [
    // {
    //   path: './src/examples/HeroSplit.tsx',
    //   name: 'HeroSplit',
    // },
    {
      path: './headless/semantic-ui/resolved/HeroSplit.tsx',
      name: 'HeroSplit',
    },
  ],
  
  // Настройки для определения тегов
  tagDetection: {
    // Маппинг для определения тега по контексту
    contextMap: {
      '<h1': 'h1',
      '<h2': 'h2',
      '<h3': 'h3',
      '<p': 'p',
      '<Button': 'button',
      '<section': 'section',
      '<article': 'article',
      '<header': 'header',
      '<footer': 'footer',
      '<main': 'main',
      '<aside': 'aside',
      '<nav': 'nav',
      '<ul': 'ul',
      '<ol': 'ol',
      '<li': 'li',
      '<a': 'a',
      '<img': 'img',
      '<span': 'span',
    },
    // Количество строк для анализа контекста
    contextLines: 3,
    // Тег по умолчанию
    defaultTag: 'div',
  },
};

// Создаем директорию результатов, если она не существует
if (!fs.existsSync(CONFIG.paths.resultDir)) {
  fs.mkdirSync(CONFIG.paths.resultDir, { recursive: true });
}

// Загружаем карту классов
let classMap: Record<string, string> = {};
try {
  if (fs.existsSync(CONFIG.paths.classMap)) {
    classMap = JSON.parse(fs.readFileSync(CONFIG.paths.classMap, 'utf-8'));
  }
} catch (error) {
  console.error('Error loading classMap:', error);
  classMap = {};
}

// Функция для определения тега по контексту
const detectTagFromContext = (context: string): string => {
  for (const [pattern, tag] of Object.entries(CONFIG.tagDetection.contextMap)) {
    if (context.includes(pattern)) {
      return tag;
    }
  }
  return CONFIG.tagDetection.defaultTag;
};

// Функция для нормализации строки классов (сортировка и удаление дубликатов)
const normalizeClassString = (classString: string) => {
  return classString.split(' ').sort().join(' ');
};

// Создаем обратную карту для поиска семантических имен по классам
const buildReverseMap = () => {
  const reverseMap: Record<string, string> = {};
  
  Object.entries(classMap).forEach(([key, classes]) => {
    // Нормализуем классы для создания консистентного ключа
    const normalizedClasses = normalizeClassString(classes);
    reverseMap[normalizedClasses] = key;
  });
  
  return reverseMap;
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
  return classMap[key] || key; // Если нет замены — оставляем ключ
};

// Функция для обновления карты классов
const updateClassMap = (tag: string, ...classes: string[]) => {
  const merged = twMerge(clsx(classes));
  
  // Сначала проверяем, есть ли уже семантическое имя для этого набора классов
  // независимо от порядка
  const normalizedClasses = normalizeClassString(merged);
  const reverseMap = buildReverseMap();
  
  if (reverseMap[normalizedClasses]) {
    // Если такой набор классов уже имеет семантическое имя, используем его
    const existingKey = reverseMap[normalizedClasses];
    console.log(`Found existing semantic name for classes: ${existingKey} -> ${merged}`);
    return existingKey;
  }
  
  // Если семантического имени нет, продолжаем как обычно
  const modifiers: string[] = [];
  const baseClasses: string[] = [];

  merged.split(" ").forEach((cls) => {
    if (cls.includes(":")) {
      modifiers.push(cls.replace(":", "-"));
    } else {
      baseClasses.push(cls);
    }
  });

  const sortedBase = baseClasses.sort().join("-");
  const sortedModifiers = modifiers.sort().join("-");
  const key = `${tag}-${sortedBase}${sortedModifiers ? "-" + sortedModifiers : ""}`;
  
  // Проверяем, есть ли уже семантическое имя для этого ключа
  if (!classMap[key]) {
    // Проверяем, есть ли уже семантическое имя для этих классов в другом порядке
    let existingSemanticName = null as string | null;
    
    // Ищем в существующих значениях карты
    for (const [existingKey, existingClasses] of Object.entries(classMap)) {
      // Если ключ уже выглядит как семантическое имя (не содержит всех классов)
      if (!existingKey.includes(sortedBase)) {
        // Проверяем, совпадают ли классы после нормализации
        if (normalizeClassString(existingClasses) === normalizedClasses) {
          existingSemanticName = existingKey;
          break;
        }
      }
    }
    
    if (existingSemanticName) {
      // Если нашли существующее семантическое имя, используем его
      classMap[key] = merged;
      console.log(`Using existing semantic name for similar classes: ${existingSemanticName} -> ${merged}`);
      return existingSemanticName;
    } else {
      // Если не нашли, добавляем новую запись
      classMap[key] = merged;
      
      // Сохраняем обновленную карту
      fs.writeFileSync(CONFIG.paths.classMap, JSON.stringify(classMap, null, 2));
      
      console.log(`Added new class mapping: ${key} -> ${merged}`);
    }
  }

  return classMap[key] || key;
};

// Анализатор компонентов
const analyzeComponents = () => {
  let totalClasses = 0;
  const allFoundClasses: Array<{component: string, tag: string, classes: string}> = [];
  
  // Анализируем каждый компонент из конфигурации
  for (const component of CONFIG.components) {
    const filePath = path.resolve(component.path);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Analyzing component: ${component.name} (${filePath})`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Находим все className в файле
    const classRegex = /className=["']([^"']+)["']/g;
    let match;
    const foundClasses: Array<{tag: string, classes: string}> = [];
    
    while ((match = classRegex.exec(content)) !== null) {
      // Определяем тег из контекста
      const prevLines = content.substring(0, match.index).split('\n').slice(-CONFIG.tagDetection.contextLines).join('\n');
      const tag = detectTagFromContext(prevLines);
      
      foundClasses.push({
        tag,
        classes: match[1]
      });
      
      allFoundClasses.push({
        component: component.name,
        tag,
        classes: match[1]
      });
      
      // Обновляем карту классов
      updateClassMap(tag, match[1]);
    }
    
    console.log(`Found ${foundClasses.length} className declarations in ${component.name}`);
    totalClasses += foundClasses.length;
  }
  
  console.log(`Total found classes: ${totalClasses}`);
  console.log('Updated classMap.json with new entries');
  
  // Очищаем карту от дубликатов
  cleanupClassMap();
  
  return allFoundClasses;
};

// Функция для очистки карты классов от дубликатов
const cleanupClassMap = () => {
  const valueMap: Record<string, string[]> = {};
  
  // Группируем ключи по нормализованным значениям
  Object.entries(classMap).forEach(([key, value]) => {
    const normalizedValue = normalizeClassString(value);
    if (!valueMap[normalizedValue]) {
      valueMap[normalizedValue] = [];
    }
    valueMap[normalizedValue].push(key);
  });
  
  // Проверяем группы с более чем одним ключом
  Object.entries(valueMap).forEach(([normalizedValue, keys]) => {
    if (keys.length > 1) {
      // Находим семантическое имя среди ключей
      const semanticKey = keys.find(key => !key.includes(normalizedValue.replace(/ /g, '-')));
      
      if (semanticKey) {
        // Если нашли семантическое имя, используем его для всех ключей с этим значением
        keys.forEach(key => {
          if (key !== semanticKey) {
            // Сохраняем значение
            const value = classMap[key];
            // Удаляем старый ключ
            delete classMap[key];
            // Добавляем новый ключ с тем же значением
            classMap[semanticKey] = value;
            console.log(`Replaced duplicate key ${key} with semantic name ${semanticKey}`);
          }
        });
      }
    }
  });
  
  // Сохраняем обновленную карту
  fs.writeFileSync(CONFIG.paths.classMap, JSON.stringify(classMap, null, 2));
};

// Функция для генерации CSS с @apply
const generateCSS = () => {
  let css = '';
  
  // Создаем обратную карту для проверки дубликатов
  const valueMap: Record<string, string[]> = {};
  
  Object.entries(classMap).forEach(([key, classes]) => {
    const normalizedClasses = normalizeClassString(classes);
    if (!valueMap[normalizedClasses]) {
      valueMap[normalizedClasses] = [];
    }
    valueMap[normalizedClasses].push(key);
  });
  
  // Генерируем CSS только для уникальных значений
  Object.entries(valueMap).forEach(([normalizedClasses, keys]) => {
    // Выбираем предпочтительный ключ (семантический, если есть)
    const preferredKey = keys.find(key => !key.includes(normalizedClasses.replace(/ /g, '-'))) || keys[0];
    const classes = classMap[preferredKey];
    
    // Используем семантическое имя, если оно есть
    const className = preferredKey.includes('-') && !preferredKey.includes(normalizedClasses.replace(/ /g, '-')) 
      ? preferredKey 
      : preferredKey;
      
    css += `.${className} { @apply ${classes}; }\n`;
  });
  
  // Сохраняем CSS в файл
  fs.writeFileSync(CONFIG.paths.cssOutput, css);
  
  // Копируем CSS в директорию результатов
  // fs.copyFileSync(CONFIG.paths.cssOutput, path.join(CONFIG.paths.resultDir, 'semantic.css'));
  
  console.log(`Generated CSS saved to ${CONFIG.paths.cssOutput}`);
  console.log(`CSS copied to ${path.join(CONFIG.paths.resultDir, 'semantic.css')}`);
  
  return css;
};

// Функция для преобразования компонентов
const transformComponents = () => {
  let transformedCount = 0;
  
  // Преобразуем каждый компонент из конфигурации
  for (const component of CONFIG.components) {
    const filePath = path.resolve(component.path);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Transforming component: ${component.name} (${filePath})`);
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Создаем обратную карту для поиска семантических имен по классам
    const reverseMap = buildReverseMap();
    
    // Находим все className в файле и заменяем их
    const classRegex = /className=["']([^"']+)["']/g;
    let match;
    let lastIndex = 0;
    let transformedContent = '';
    
    while ((match = classRegex.exec(content)) !== null) {
      // Добавляем текст до текущего совпадения
      transformedContent += content.substring(lastIndex, match.index);
      
      // Определяем тег из контекста
      const prevLines = content.substring(0, match.index).split('\n').slice(-CONFIG.tagDetection.contextLines).join('\n');
      const tag = detectTagFromContext(prevLines);
      
      // Получаем оригинальные классы
      const originalClasses = match[1];
      
      // Нормализуем классы
      const normalizedClasses = normalizeClassString(twMerge(originalClasses));
      
      // Ищем семантическое имя
      let semanticName = '';
      
      // Сначала проверяем в обратной карте
      if (reverseMap[normalizedClasses]) {
        semanticName = reverseMap[normalizedClasses];
      } else {
        // Если не нашли, генерируем ключ как обычно
        const modifiers: string[] = [];
        const baseClasses: string[] = [];
        
        originalClasses.split(" ").forEach((cls) => {
          if (cls.includes(":")) {
            modifiers.push(cls.replace(":", "-"));
          } else {
            baseClasses.push(cls);
          }
        });
        
        const sortedBase = baseClasses.sort().join("-");
        const sortedModifiers = modifiers.sort().join("-");
        const key = `${tag}-${sortedBase}${sortedModifiers ? "-" + sortedModifiers : ""}`;
        
        semanticName = classMap[key] || key;
      }
      
      // Если семантическое имя выглядит как ключ (не было замены), используем оригинальные классы
      if (semanticName.includes(normalizedClasses.replace(/ /g, '-'))) {
        transformedContent += `className="${originalClasses}"`;
      } else {
        // Иначе используем семантическое имя
        transformedContent += `className="${semanticName}"`;
      }
      
      // Обновляем lastIndex
      lastIndex = match.index + match[0].length;
    }
    
    // Добавляем оставшийся текст
    transformedContent += content.substring(lastIndex);
    
    // Сохраняем преобразованный компонент
    const outputPath = path.join(CONFIG.paths.resultDir, `${component.name}.tsx`);
    fs.writeFileSync(outputPath, transformedContent);
    
    console.log(`Transformed component saved to ${outputPath}`);
    transformedCount++;
  }
  
  console.log(`Transformed ${transformedCount} components`);
  
  return transformedCount > 0;
};

// Обработка команд
const command = process.argv[2];

switch (command) {
  case 'analyze':
    console.log('Analyzing components...');
    const classes = analyzeComponents();
    console.log(`Found ${classes?.length || 0} className declarations in total`);
    break;
    
  case 'generate':
    console.log('Generating semantic CSS...');
    const css = generateCSS();
    console.log('CSS generated successfully!');
    
    // Показываем статистику
    console.log(`Total semantic classes: ${Object.keys(classMap).length}`);
    break;
    
  case 'transform':
    console.log('Transforming components with semantic class names...');
    transformComponents();
    break;
    
  default:
    console.log(`
Semantic UI Generator CLI

Commands:
  analyze   - Analyze components and update class map
  generate  - Generate semantic CSS from class map
  transform - Transform components to use semantic class names
    `);
} 