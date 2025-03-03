import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { twMerge } from 'tailwind-merge';
import os from 'os';
import { execSync } from 'child_process';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

// Конфигурация путей
const CONFIG = {
  paths: {
    sourceDir: path.resolve(process.cwd(), './src/source'),
    componentOutput: path.resolve(process.cwd(), './src/components'),
    classObject: path.resolve('./src/components/classObject.ts'),
    domAnalysisResults: path.resolve('./src/components/domAnalysis.json'),
  },
  classNames: {
    semanticPrefix: 'semantic-',
    quarkPrefix: 'q-',
  }
};

// Типы для хранения информации о классах
export interface ClassEntry {
  quark: string;
  semantic: string;
  classes: string;
  components: Record<string, {
    path: string;
    name: string;
  }>;
}

export interface EnhancedClassEntry extends ClassEntry {
  componentName: string;     // Название компонента
  elementType: string;       // HTML тег
  variants: {                // Варианты компонента (если есть)
    [key: string]: string | undefined;
  };
  isPublic: boolean;         // Видимый элемент или вспомогательный
}

// Загрузка существующего объекта классов
export const loadClassObject = (): Record<string, ClassEntry> => {
  try {
    if (fs.existsSync(CONFIG.paths.domAnalysisResults)) {
      const jsonContent = fs.readFileSync(CONFIG.paths.domAnalysisResults, 'utf-8');
      const results = JSON.parse(jsonContent) as EnhancedClassEntry[];
      
      // Преобразуем массив в объект с ключами semantic
      const classObj: Record<string, ClassEntry> = {};
      results.forEach(entry => {
        classObj[entry.semantic] = {
          quark: entry.quark,
          semantic: entry.semantic,
          classes: entry.classes,
          components: entry.components
        };
      });
      
      return classObj;
    }
    return {};
  } catch (error) {
    console.error('Error loading class data:', error);
    return {};
  }
};

// Нормализация строки классов
export const normalizeClassString = (classString: string): string => {
  return classString.split(' ').sort().join(' ');
};

// Генерация кварк-имени
const generateQuarkName = (classes: string): string => {
  const normalizedClasses = normalizeClassString(classes);
  
  return CONFIG.classNames.quarkPrefix + normalizedClasses
    .split(' ')
    .map(cls => {
      const parts = cls.split(':');
      const baseCls = parts[parts.length - 1];
      
      if (baseCls.match(/\d+/)) {
        return baseCls.replace(/[^\d]/g, '') || '';
      }
      
      return baseCls
        .split('-')
        .map(word => word[0])
        .join('')
        .toLowerCase();
    })
    .join('');
};

// Генерация семантического имени
const generateSemanticName = (componentName: string, elementType: string): string => {
  return `${CONFIG.classNames.semanticPrefix}${componentName.toLowerCase()}-${elementType}`;
};

const execAsync = promisify(exec);

// Функция для определения текущего пакетного менеджера
const detectPackageManager = (): string => {
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('bun.lockb')) return 'bun';
  return 'npm'; // По умолчанию npm
};

// Функция для рендеринга компонента и получения DOM
const renderComponentToDOM = async (componentPath: string): Promise<Document | null> => {
  try {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    const tempDir = path.resolve('./temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Создаем временный файл для рендеринга с расширением .tsx
    const tempFile = path.join(tempDir, `render-${componentName}.tsx`);
    
    // Создаем содержимое файла для рендеринга
    const renderCode = `
      import React from 'react';
      import { renderToString } from 'react-dom/server';
      import { ${componentName} } from '${componentPath.replace(/\\/g, '/')}';
      
      // Рендерим компонент в строку HTML
      try {
        const html = renderToString(React.createElement(${componentName}));
        console.log(html);
      } catch (error) {
        console.error('Error rendering component:', error);
        process.exit(1);
      }
    `;
    
    fs.writeFileSync(tempFile, renderCode);
    
    // Определяем команду в зависимости от пакетного менеджера
    const packageManager = detectPackageManager();
    let command: string;
    
    switch (packageManager) {
      case 'pnpm':
        command = `pnpm tsx "${tempFile}"`;
        break;
      case 'yarn':
        command = `yarn tsx "${tempFile}"`;
        break;
      case 'bun':
        command = `bun run "${tempFile}"`;
        break;
      default:
        command = `npx tsx "${tempFile}"`;
    }
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        encoding: 'utf-8'
      });
      
      // Удаляем временный файл
      fs.unlinkSync(tempFile);
      
      if (stderr && !stdout) {
        console.error(`Error rendering ${componentName}:`, stderr);
        return null;
      }
      
      // Создаем DOM из HTML
      const dom = new JSDOM(`<!DOCTYPE html><html><body>${stdout}</body></html>`);
      return dom.window.document;
    } catch (error) {
      console.error(`Error executing render script for ${componentName}:`, error);
      
      // Удаляем временный файл даже в случае ошибки
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
      return null;
    }
  } catch (error) {
    console.error(`Failed to render component:`, error);
    return null;
  }
};

// Функция для извлечения классов из DOM
const extractClassesFromDOM = (document: Document, componentPath: string): EnhancedClassEntry[] => {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const componentDir = path.dirname(componentPath);
  const classEntries: EnhancedClassEntry[] = [];
  
  // Находим все элементы с классами
  document.querySelectorAll('*[class]').forEach(element => {
    const classes = element.getAttribute('class') || '';
    const elementType = element.tagName.toLowerCase();
    
    // Пропускаем пустые классы
    if (!classes.trim()) return;
    
    console.log(`Found element: ${elementType} with classes: ${classes}`);
    
    // Создаем объект с подробной информацией
    const classEntry: EnhancedClassEntry = {
      quark: generateQuarkName(classes),
      semantic: generateSemanticName(componentName, elementType),
      classes,
      componentName,
      elementType,
      variants: {}, // Упрощаем - не определяем варианты
      isPublic: true,
      components: {
        [componentName]: {
          path: componentDir,
          name: componentName
        }
      }
    };
    
    classEntries.push(classEntry);
  });
  
  return classEntries;
};

// Функция для анализа компонента
export const analyzeShadcnComponent = async (componentPath: string): Promise<EnhancedClassEntry[]> => {
  console.log(`Analyzing component: ${path.basename(componentPath)}`);
  
  // Рендерим компонент и получаем DOM
  const document = await renderComponentToDOM(componentPath);
  
  if (document) {
    // Извлекаем классы из DOM
    const entries = extractClassesFromDOM(document, componentPath);
    console.log(`Found ${entries.length} class entries in rendered DOM`);
    return entries;
  }
  
  console.log('Failed to render component');
  return [];
};

// Функция для анализа всех компонентов через DOM
export const analyzeDomComponents = async (sourceDir: string = CONFIG.paths.sourceDir): Promise<EnhancedClassEntry[]> => {
  // Получаем список всех компонентов
  const components = scanDirectory(sourceDir);
  const results: EnhancedClassEntry[] = [];
  
  for (const component of components) {
    console.log(`DOM analyzing: ${component.name}`);
    
    try {
      const entries = await analyzeShadcnComponent(component.path);
      
      if (entries.length > 0) {
        results.push(...entries);
        console.log(`Successfully analyzed ${component.name}, found ${entries.length} class entries`);
      } else {
        console.warn(`No class entries found for ${component.name}`);
      }
    } catch (error) {
      console.error(`Error analyzing ${component.name}:`, error);
    }
  }
  
  // Сохраняем результаты в отдельный файл
  fs.writeFileSync(
    CONFIG.paths.domAnalysisResults, 
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Total class entries found: ${results.length}`);
  return results;
};

// Функция для сканирования директории
export const scanDirectory = (dir: string): Array<{ path: string; name: string; relativePath: string }> => {
  const components: Array<{ path: string; name: string; relativePath: string }> = [];
  
  const scan = (currentDir: string, relativeDirPath: string = '') => {
    const files = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(currentDir, file.name);
      const relativeFilePath = path.join(relativeDirPath, file.name);
      
      if (file.isDirectory()) {
        scan(filePath, relativeFilePath);
      } else if (file.isFile() && /\.(tsx|jsx|vue|svelte|html|hbs|handlebars)$/.test(file.name)) {
        const componentName = path.basename(file.name, path.extname(file.name));
        components.push({
          path: filePath,
          name: componentName,
          relativePath: relativeFilePath
        });
      }
    }
  };
  
  scan(dir);
  return components;
};

// Функция для объединения результатов DOM анализа с существующим classObject
export const mergeAnalysisResults = () => {
  // Загружаем текущий classObject
  let classObject = loadClassObject();
  
  // Загружаем результаты DOM анализа
  const domResults: EnhancedClassEntry[] = JSON.parse(
    fs.readFileSync(CONFIG.paths.domAnalysisResults, 'utf-8')
  );
  
  // Для каждого результата DOM анализа
  domResults.forEach(domEntry => {
    // Проверяем, есть ли соответствующая запись в classObject
    let matchingKey: string | undefined;
    
    Object.entries(classObject).forEach(([key, entry]) => {
      const normalizedExisting = normalizeClassString(entry.classes);
      const normalizedNew = normalizeClassString(domEntry.classes);
      
      if (normalizedExisting === normalizedNew) {
        matchingKey = key;
      }
    });
    
    if (matchingKey) {
      // Если есть, обогащаем запись дополнительной информацией
      const existingEntry = classObject[matchingKey];
      classObject[matchingKey] = {
        ...existingEntry,
        // Обновляем семантическое имя с учетом контекста
        semantic: domEntry.semantic,
        // Добавляем компонент, если его еще нет
        components: {
          ...existingEntry.components,
          [domEntry.componentName]: {
            path: domEntry.components[domEntry.componentName].path,
            name: domEntry.componentName
          }
        }
      };
    } else {
      // Если нет, создаем новую запись
      classObject[domEntry.semantic] = {
        quark: domEntry.quark,
        semantic: domEntry.semantic,
        classes: domEntry.classes,
        components: domEntry.components
      };
    }
  });
  
  // Сохраняем обновленный classObject
  const fileContent = `// Generated class object mapping
// DO NOT EDIT MANUALLY

export const classObject = ${JSON.stringify(classObject, null, 2)};
`;
  fs.writeFileSync(CONFIG.paths.classObject, fileContent);
  
  return classObject;
};

// Функция для подготовки CSS с семантическими и кварк классами
export const generateCSS = (classObject: Record<string, ClassEntry>) => {
  let quarkCSS = '';
  let semanticCSS = '';
  
  Object.values(classObject).forEach(entry => {
    quarkCSS += `.${entry.quark} { @apply ${entry.classes}; }\n`;
    semanticCSS += `.${entry.semantic} { @apply ${entry.classes}; }\n`;
  });
  
  return { quarkCSS, semanticCSS };
};

// Функция для трансформации компонентов
export const transformComponents = (
  sourceDir: string = CONFIG.paths.sourceDir,
  targetOutputDir: string = CONFIG.paths.componentOutput
) => {
  // Получаем список компонентов
  const components = scanDirectory(sourceDir);
  
  // Загружаем данные напрямую из JSON для более точного сопоставления
  let domAnalysisData: EnhancedClassEntry[] = [];
  try {
    const jsonContent = fs.readFileSync(CONFIG.paths.domAnalysisResults, 'utf-8');
    domAnalysisData = JSON.parse(jsonContent);
    console.log(`Loaded ${domAnalysisData.length} class entries from domAnalysis.json`);
  } catch (error) {
    console.error('Error loading domAnalysis.json:', error);
    return;
  }
  
  // Создаем карту классов для быстрого поиска
  const classMap = new Map<string, { semantic: string, quark: string }>();
  
  domAnalysisData.forEach(entry => {
    // Используем оригинальную строку классов как ключ
    classMap.set(entry.classes, {
      semantic: entry.semantic,
      quark: entry.quark
    });
    
    // Также добавляем нормализованную версию для надежности
    const normalizedClasses = normalizeClassString(entry.classes);
    if (normalizedClasses !== entry.classes) {
      classMap.set(normalizedClasses, {
        semantic: entry.semantic,
        quark: entry.quark
      });
    }
  });
  
  console.log(`Created class map with ${classMap.size} entries`);
  
  for (const component of components) {
    console.log(`Processing component: ${component.name}`);
    
    // Читаем содержимое компонента
    const content = fs.readFileSync(component.path, 'utf-8');
    
    // Создаем версии с семантическими и кварк классами
    let semanticContent = content;
    let quarkContent = content;
    
    // Находим все классы с помощью регулярного выражения
    const classRegex = /className=["']([^"']+)["']/g;
    let match;
    
    // Массив для хранения всех найденных классов
    const foundClasses: Array<{
      fullMatch: string;
      classValue: string;
      index: number;
    }> = [];
    
    // Находим все вхождения className
    while ((match = classRegex.exec(content)) !== null) {
      foundClasses.push({
        fullMatch: match[0],
        classValue: match[1],
        index: match.index
      });
    }
    
    console.log(`Found ${foundClasses.length} className declarations in ${component.name}`);
    
    // Обрабатываем найденные классы в обратном порядке (чтобы индексы не сбивались)
    for (let i = foundClasses.length - 1; i >= 0; i--) {
      const { fullMatch, classValue, index } = foundClasses[i];
      
      // Проверяем прямое совпадение
      if (classMap.has(classValue)) {
        const replacement = classMap.get(classValue)!;
        
        // Заменяем в семантической версии
        semanticContent = 
          semanticContent.substring(0, index) + 
          `className="${replacement.semantic}"` + 
          semanticContent.substring(index + fullMatch.length);
        
        // Заменяем в кварк версии
        quarkContent = 
          quarkContent.substring(0, index) + 
          `className="${replacement.quark}"` + 
          quarkContent.substring(index + fullMatch.length);
        
        console.log(`Replaced "${classValue}" with semantic: "${replacement.semantic}" and quark: "${replacement.quark}"`);
        continue;
      }
      
      // Проверяем нормализованную версию
      const normalizedClassValue = normalizeClassString(classValue);
      if (classMap.has(normalizedClassValue)) {
        const replacement = classMap.get(normalizedClassValue)!;
        
        // Заменяем в семантической версии
        semanticContent = 
          semanticContent.substring(0, index) + 
          `className="${replacement.semantic}"` + 
          semanticContent.substring(index + fullMatch.length);
        
        // Заменяем в кварк версии
        quarkContent = 
          quarkContent.substring(0, index) + 
          `className="${replacement.quark}"` + 
          quarkContent.substring(index + fullMatch.length);
        
        console.log(`Replaced normalized "${normalizedClassValue}" with semantic: "${replacement.semantic}" and quark: "${replacement.quark}"`);
        continue;
      }
      
      console.log(`No replacement found for "${classValue}"`);
    }
    
    // Создаем выходные директории
    const outputPath = path.join(targetOutputDir, component.relativePath);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Получаем базовое имя файла и расширение
    const baseName = path.basename(outputPath, path.extname(outputPath));
    const extension = path.extname(outputPath);
    
    // Сохраняем трансформированные компоненты
    const semanticOutputPath = path.join(outputDir, `${baseName}.semantic${extension}`);
    const quarkOutputPath = path.join(outputDir, `${baseName}.quark${extension}`);
    
    fs.writeFileSync(semanticOutputPath, semanticContent);
    fs.writeFileSync(quarkOutputPath, quarkContent);
    
    console.log(`Transformed component ${component.name} saved`);
  }
}; 