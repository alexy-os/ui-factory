#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const FILE_NAMES = {
  sourceDir: 'source',
  outputDir: 'components',
  classMap: 'classMap',
  cssOutput: 'quark',
}

const CONFIG = {
    paths: {
    classMap: path.resolve(`./generations/quark-ui/${FILE_NAMES.classMap}.json`),
    resultDir: path.resolve(`./generations/quark-ui/${FILE_NAMES.outputDir}`),
    cssOutput: path.resolve(`./generations/quark-ui/${FILE_NAMES.cssOutput}.css`),
  },
  
    components: [
    // {
    //   path: './src/examples/HeroSplit.tsx',
    //   name: 'HeroSplit',
    // },
    {
      path: `./generations/quark-ui/${FILE_NAMES.sourceDir}/HeroSplit.tsx`,
      name: 'HeroSplit',
    },
  ],
  
    tagDetection: {
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
        contextLines: 3,
        defaultTag: 'div',
  },
};

if (!fs.existsSync(CONFIG.paths.resultDir)) {
  fs.mkdirSync(CONFIG.paths.resultDir, { recursive: true });
}

let classMap: Record<string, string> = {};
try {
  if (fs.existsSync(CONFIG.paths.classMap)) {
    classMap = JSON.parse(fs.readFileSync(CONFIG.paths.classMap, 'utf-8'));
  }
} catch (error) {
  console.error('Error loading classMap:', error);
  classMap = {};
}

const detectTagFromContext = (context: string): string => {
  for (const [pattern, tag] of Object.entries(CONFIG.tagDetection.contextMap)) {
    if (context.includes(pattern)) {
      return tag;
    }
  }
  return CONFIG.tagDetection.defaultTag;
};

const normalizeClassString = (classString: string) => {
  return classString.split(' ').sort().join(' ');
};

const buildReverseMap = () => {
  const reverseMap: Record<string, string> = {};
  
  Object.entries(classMap).forEach(([key, classes]) => {
        const normalizedClasses = normalizeClassString(classes);
    reverseMap[normalizedClasses] = key;
  });
  
  return reverseMap;
};

const normalizeClassName = (tag: string, ...classes: string[]) => {
    const merged = twMerge(clsx(classes));

    const modifiers: string[] = [];
  const baseClasses: string[] = [];

  merged.split(" ").forEach((cls) => {
    if (cls.includes(":")) {
      modifiers.push(cls.replace(":", "-"));     } else {
      baseClasses.push(cls);
    }
  });

    const sortedBase = baseClasses.sort().join("-");
  const sortedModifiers = modifiers.sort().join("-");
  const key = `${tag}-${sortedBase}${sortedModifiers ? "-" + sortedModifiers : ""}`;

    return classMap[key] || key; };

const generateShortKey = (classes: string) => {
  const normalizedClasses = normalizeClassString(classes);
  
  return normalizedClasses
    .split(' ')
    .map(cls => {
      // Для классов с модификаторами (например, lg:flex) берем первые буквы после двоеточия
      const parts = cls.split(':');
      const baseCls = parts[parts.length - 1];
      
      // Для специальных классов с цифрами
      if (baseCls.match(/\d+/)) {
        return baseCls.replace(/[^\d]/g, '') || '';
      }
      
      // Берем первые буквы слов
      return baseCls
        .split('-')
        .map(word => word[0])
        .join('')
        .toLowerCase();
    })
    .join('');
};

const updateClassMap = (tag: string, ...classes: string[]) => {
  const merged = twMerge(clsx(classes));
  
  const normalizedClasses = normalizeClassString(merged);
  const reverseMap = buildReverseMap();
  
  // Проверяем существующие маппинги
  if (reverseMap[normalizedClasses]) {
    const existingKey = reverseMap[normalizedClasses];
    console.log(`Found existing semantic name for classes: ${existingKey} -> ${merged}`);
    return existingKey;
  }
  
  // Генерируем короткий ключ
  const shortKey = generateShortKey(merged);
  
  // Если ключа еще нет в маппинге, добавляем
  if (!classMap[shortKey]) {
    classMap[shortKey] = merged;
    
    fs.writeFileSync(CONFIG.paths.classMap, JSON.stringify(classMap, null, 2));
    
    console.log(`Added new class mapping: ${shortKey} -> ${merged}`);
  }

  return shortKey;
};

const analyzeComponents = () => {
  let totalClasses = 0;
  const allFoundClasses: Array<{component: string, tag: string, classes: string}> = [];
  
    for (const component of CONFIG.components) {
    const filePath = path.resolve(component.path);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Analyzing component: ${component.name} (${filePath})`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
        const classRegex = /className=["']([^"']+)["']/g;
    let match;
    const foundClasses: Array<{tag: string, classes: string}> = [];
    
    while ((match = classRegex.exec(content)) !== null) {
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
      
            updateClassMap(tag, match[1]);
    }
    
    console.log(`Found ${foundClasses.length} className declarations in ${component.name}`);
    totalClasses += foundClasses.length;
  }
  
  console.log(`Total found classes: ${totalClasses}`);
  console.log('Updated classMap.json with new entries');
  
    cleanupClassMap();
  
  return allFoundClasses;
};

const cleanupClassMap = () => {
  const valueMap: Record<string, string[]> = {};
  
    Object.entries(classMap).forEach(([key, value]) => {
    const normalizedValue = normalizeClassString(value);
    if (!valueMap[normalizedValue]) {
      valueMap[normalizedValue] = [];
    }
    valueMap[normalizedValue].push(key);
  });
  
    Object.entries(valueMap).forEach(([normalizedValue, keys]) => {
    if (keys.length > 1) {
            const semanticKey = keys.find(key => !key.includes(normalizedValue.replace(/ /g, '-')));
      
      if (semanticKey) {
                keys.forEach(key => {
          if (key !== semanticKey) {
                        const value = classMap[key];
                        delete classMap[key];
                        classMap[semanticKey] = value;
            console.log(`Replaced duplicate key ${key} with semantic name ${semanticKey}`);
          }
        });
      }
    }
  });
  
    fs.writeFileSync(CONFIG.paths.classMap, JSON.stringify(classMap, null, 2));
};

const generateCSS = () => {
  let css = '';
  
  const valueMap: Record<string, string[]> = {};
  
  Object.entries(classMap).forEach(([key, classes]) => {
    const normalizedClasses = normalizeClassString(classes);
    if (!valueMap[normalizedClasses]) {
      valueMap[normalizedClasses] = [];
    }
    valueMap[normalizedClasses].push(key);
  });
  
  Object.entries(valueMap).forEach(([normalizedClasses, keys]) => {
    const preferredKey = keys[0];
    const classes = classMap[preferredKey];
    
    css += `.${preferredKey} { @apply ${classes}; }\n`;
  });
  
  fs.writeFileSync(CONFIG.paths.cssOutput, css);
  
  fs.copyFileSync(CONFIG.paths.cssOutput, path.join(CONFIG.paths.resultDir, `${FILE_NAMES.cssOutput}.css`));
  
  console.log(`Generated CSS saved to ${CONFIG.paths.cssOutput}`);
  console.log(`CSS copied to ${path.join(CONFIG.paths.resultDir, `${FILE_NAMES.cssOutput}.css`)}`);
  
  return css;
};

const transformComponents = () => {
  let transformedCount = 0;
  
    for (const component of CONFIG.components) {
    const filePath = path.resolve(component.path);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Transforming component: ${component.name} (${filePath})`);
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
        const reverseMap = buildReverseMap();
    
        const classRegex = /className=["']([^"']+)["']/g;
    let match;
    let lastIndex = 0;
    let transformedContent = '';
    
    while ((match = classRegex.exec(content)) !== null) {
            transformedContent += content.substring(lastIndex, match.index);
      
            const prevLines = content.substring(0, match.index).split('\n').slice(-CONFIG.tagDetection.contextLines).join('\n');
      const tag = detectTagFromContext(prevLines);
      
            const originalClasses = match[1];
      
            const normalizedClasses = normalizeClassString(twMerge(originalClasses));
      
            const semanticName = generateShortKey(normalizedClasses);
      
            transformedContent += `className="${semanticName}"`;
      
            lastIndex = match.index + match[0].length;
    }
    
        transformedContent += content.substring(lastIndex);
    
        const outputPath = path.join(CONFIG.paths.resultDir, `${component.name}.tsx`);
    fs.writeFileSync(outputPath, transformedContent);
    
    console.log(`Transformed component saved to ${outputPath}`);
    transformedCount++;
  }
  
  console.log(`Transformed ${transformedCount} components`);
  
  return transformedCount > 0;
};

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