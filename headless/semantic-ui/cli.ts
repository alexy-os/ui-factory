#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Путь к файлу с картой классов
const CLASS_MAP_PATH = path.resolve('./headless/semantic-ui/classMap.json');

// Загружаем карту классов
let classMap: Record<string, string> = {};
try {
  if (fs.existsSync(CLASS_MAP_PATH)) {
    classMap = JSON.parse(fs.readFileSync(CLASS_MAP_PATH, 'utf-8'));
  }
} catch (error) {
  console.error('Error loading classMap:', error);
  classMap = {};
}

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
  
  // Генерируем ключ так же, как в normalizeClassName
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
  
  // Если ключа нет в карте, добавляем его
  if (!classMap[key]) {
    classMap[key] = merged; // Сохраняем оригинальные классы
    
    // Сохраняем обновленную карту
    fs.writeFileSync(CLASS_MAP_PATH, JSON.stringify(classMap, null, 2));
    
    console.log(`Added new class mapping: ${key} -> ${merged}`);
  }

  return classMap[key] || key;
};

// Анализатор компонента HeroSplit
const analyzeHeroSplit = () => {
  // Путь к файлу HeroSplit.tsx
  const filePath = path.resolve('./src/examples/HeroSplit.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Находим все className в файле
  const classRegex = /className=["']([^"']+)["']/g;
  let match;
  const foundClasses: Array<{tag: string, classes: string}> = [];
  
  while ((match = classRegex.exec(content)) !== null) {
    // Определяем тег (упрощенно)
    let tag = 'div'; // По умолчанию div
    
    // Пытаемся определить тег из контекста
    const prevLines = content.substring(0, match.index).split('\n').slice(-3).join('\n');
    if (prevLines.includes('<h2')) tag = 'h2';
    else if (prevLines.includes('<p')) tag = 'p';
    else if (prevLines.includes('<Button')) tag = 'button';
    else if (prevLines.includes('<section')) tag = 'section';
    
    foundClasses.push({
      tag,
      classes: match[1]
    });
    
    // Обновляем карту классов
    updateClassMap(tag, match[1]);
  }
  
  console.log(`Found ${foundClasses.length} className declarations in HeroSplit.tsx`);
  console.log('Updated classMap.json with new entries');
  
  return foundClasses;
};

// Функция для генерации CSS с @apply
const generateCSS = () => {
  let css = '';
  
  Object.entries(classMap).forEach(([key, classes]) => {
    // Если ключ уже семантический (не содержит исходный ключ), используем его
    const className = key.includes('-') ? key : classes;
    css += `.${className} { @apply ${classes}; }\n`;
  });
  
  // Сохраняем CSS в файл
  const cssPath = path.resolve('./headless/semantic-ui/semantic.css');
  fs.writeFileSync(cssPath, css);
  
  console.log(`Generated CSS saved to semantic.css`);
  return css;
};

// Обработка команд
const command = process.argv[2];

switch (command) {
  case 'analyze':
    console.log('Analyzing HeroSplit component...');
    const classes = analyzeHeroSplit();
    console.log(`Found ${classes?.length || 0} className declarations`);
    break;
    
  case 'generate':
    console.log('Generating semantic CSS...');
    const css = generateCSS();
    console.log('CSS generated successfully!');
    
    // Показываем статистику
    console.log(`Total semantic classes: ${Object.keys(classMap).length}`);
    break;
    
  default:
    console.log(`
Semantic UI Generator CLI

Commands:
  analyze   - Analyze components and update class map
  generate  - Generate semantic CSS from class map
    `);
} 