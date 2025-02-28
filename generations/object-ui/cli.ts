#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { twMerge } from 'tailwind-merge';

const FILE_NAMES = {
  sourceDir: 'source',
  outputDir: 'components',
  semanticDir: 'semantic',
  quarkDir: 'quark',
  classObject: 'classObject',
  cssOutputQuark: 'quark',
  cssOutputSemantic: 'semantic',
}

const CONFIG = {
  paths: {
    classObject: path.resolve(`./generations/object-ui/${FILE_NAMES.classObject}.ts`),
    resultDir: path.resolve(`./generations/object-ui/${FILE_NAMES.outputDir}`),
    semanticDir: path.resolve(`./generations/object-ui/${FILE_NAMES.outputDir}/${FILE_NAMES.semanticDir}`),
    quarkDir: path.resolve(`./generations/object-ui/${FILE_NAMES.outputDir}/${FILE_NAMES.quarkDir}`),
    cssOutputQuark: path.resolve(`./generations/object-ui/${FILE_NAMES.cssOutputQuark}.css`),
    cssOutputSemantic: path.resolve(`./generations/object-ui/${FILE_NAMES.cssOutputSemantic}.css`),
    sourceDir: path.resolve(`./generations/object-ui/${FILE_NAMES.sourceDir}`),
  },
  
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

[CONFIG.paths.resultDir, CONFIG.paths.semanticDir, CONFIG.paths.quarkDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

type ClassEntry = {
  quark: string;
  semantic: string;
  classes: string;
  components: Record<string, {
    path: string;
    name: string;
  }>;
};

let classObject: Record<string, ClassEntry> = {};
try {
  if (fs.existsSync(CONFIG.paths.classObject)) {
    const classObjectContent = fs.readFileSync(CONFIG.paths.classObject, 'utf-8');
        const objectMatch = classObjectContent.match(/export\s+const\s+classObject\s*=\s*({[\s\S]*});/);
    if (objectMatch && objectMatch[1]) {
            classObject = eval(`(${objectMatch[1]})`);
            
                        Object.keys(classObject).forEach(key => {
              if (!classObject[key].components) {
                classObject[key].components = {};
              }
            });
    }
  }
} catch (error) {
  console.error('Error loading classObject:', error);
  classObject = {};
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
  
  Object.entries(classObject).forEach(([key, entry]) => {
    const normalizedClasses = normalizeClassString(entry.classes);
    reverseMap[normalizedClasses] = key;
  });
  
  return reverseMap;
};

const generateShortKey = (classes: string) => {
  const normalizedClasses = normalizeClassString(classes);
  
  return normalizedClasses
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

const generateSemanticKey = (tag: string, classes: string) => {
  const merged = classes;
  
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
  return `${tag}-${sortedBase}${sortedModifiers ? "-" + sortedModifiers : ""}`;
};

const updateClassObject = (tag: string, classes: string, componentInfo: { name: string; path: string }) => {
  const merged = twMerge(classes);
  
  const normalizedClasses = normalizeClassString(merged);
  const reverseMap = buildReverseMap();
  
  let objectKey = '';
  
  if (reverseMap[normalizedClasses]) {
    objectKey = reverseMap[normalizedClasses];
    console.log(`Found existing entry for classes: ${objectKey}`);
    
        if (!classObject[objectKey].components[componentInfo.name]) {
      classObject[objectKey].components[componentInfo.name] = {
        path: componentInfo.path,
        name: componentInfo.name
      };
      saveClassObject();
      console.log(`Added component ${componentInfo.name} to existing class mapping: ${objectKey}`);
    }
  } else {
    const quarkKey = generateShortKey(merged);
    const semanticKey = generateSemanticKey(tag, merged);
    
    objectKey = semanticKey;
    
    if (!classObject[objectKey]) {
      classObject[objectKey] = {
        quark: quarkKey,
        semantic: semanticKey,
        classes: merged,
        components: {
          [componentInfo.name]: {
            path: componentInfo.path,
            name: componentInfo.name
          }
        }
      };
      
      saveClassObject();
      
      console.log(`Added new class mapping: ${objectKey} -> ${merged}`);
    } else if (!classObject[objectKey].components[componentInfo.name]) {
      classObject[objectKey].components[componentInfo.name] = {
        path: componentInfo.path,
        name: componentInfo.name
      };
      saveClassObject();
      console.log(`Added component ${componentInfo.name} to existing class mapping: ${objectKey}`);
    }
  }

  return objectKey;
};

const saveClassObject = () => {
  const fileContent = `// Generated class object mapping
// DO NOT EDIT MANUALLY

export const classObject = ${JSON.stringify(classObject, null, 2)};
`;
  fs.writeFileSync(CONFIG.paths.classObject, fileContent);
};

const TAILWIND_CLASS_PATTERNS = {
    static: /(?:class|className)=["']([^"']+)["']/g,
  
    reactDynamic: /className=\{(?:clsx|cn|classNames)\(\s*(?:['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])*)\s*\)\}/g,
  reactTemplate: /className=\{`([^`]+)`\}/g,
  
    vueBinding: /:class="(?:\[?['`]([^'`]+)['`]\]?)"/g,
  
    svelteClass: /class=["']([^"']+)["']/g,
  
  // HTML/Handlebars
  htmlClass: /class=["']([^"']+)["']/g,
  
    cvaObject: /const\s+(\w+)(?:Variants)?\s*=\s*cva\(\s*["'`]([^"'`]+)["'`]/g,
  cvaVariants: /variants\s*:\s*{([^}]+)}/g,
  cvaVariantValues: /["'`]([^"'`]+)["'`]\s*:\s*["'`]([^"'`]+)["'`]/g
};

const extractClassesFromStyleObjects = (content: string): Array<{ name: string; classes: string }> => {
  const styleObjects: Array<{ name: string; classes: string }> = [];
  
    const cvaPattern = TAILWIND_CLASS_PATTERNS.cvaObject;
  let cvaMatch;
  
  while ((cvaMatch = cvaPattern.exec(content)) !== null) {
    const objectName = cvaMatch[1];
    const baseClasses = cvaMatch[2];
    
        styleObjects.push({
      name: objectName,
      classes: baseClasses
    });
    
        const variantsSection = content.substring(cvaMatch.index);
    const variantsMatch = TAILWIND_CLASS_PATTERNS.cvaVariants.exec(variantsSection);
    
    if (variantsMatch) {
      const variantsContent = variantsMatch[1];
      let variantValueMatch;
      const variantValuesPattern = TAILWIND_CLASS_PATTERNS.cvaVariantValues;
      
            variantValuesPattern.lastIndex = 0;
      
      while ((variantValueMatch = variantValuesPattern.exec(variantsContent)) !== null) {
                styleObjects.push({
          name: `${objectName}_${variantValueMatch[1]}`,
          classes: variantValueMatch[2]
        });
      }
    }
  }
  
  return styleObjects;
};

const extractTailwindClasses = (content: string, filePath: string, componentInfo: { name: string; path: string }): TailwindClassMatch[] => {
  const foundClasses: TailwindClassMatch[] = [];
  const fileExt = path.extname(filePath).toLowerCase();
  
    const styleObjects = extractClassesFromStyleObjects(content);
  for (const styleObject of styleObjects) {
    const tag = 'div';     foundClasses.push({
      tag,
      classes: styleObject.classes,
      position: 0,       source: 'styleObject',
      objectName: styleObject.name
    });
  }
  
    const patterns: RegExp[] = [];
  patterns.push(TAILWIND_CLASS_PATTERNS.static);   
  if (['.jsx', '.tsx'].includes(fileExt)) {
    patterns.push(TAILWIND_CLASS_PATTERNS.reactDynamic);
    patterns.push(TAILWIND_CLASS_PATTERNS.reactTemplate);
  } else if (['.vue'].includes(fileExt)) {
    patterns.push(TAILWIND_CLASS_PATTERNS.vueBinding);
  } else if (['.svelte'].includes(fileExt)) {
    patterns.push(TAILWIND_CLASS_PATTERNS.svelteClass);
  } else if (['.html', '.hbs', '.handlebars'].includes(fileExt)) {
    patterns.push(TAILWIND_CLASS_PATTERNS.htmlClass);
  }
  
    for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;     
    while ((match = pattern.exec(content)) !== null) {
      const prevLines = content.substring(0, match.index).split('\n').slice(-CONFIG.tagDetection.contextLines).join('\n');
      const tag = detectTagFromContext(prevLines);
      
                  if (match[1]) {
                        const classes = twMerge(match[1]);
        
        foundClasses.push({
          tag,
          classes,
          position: match.index,
          source: 'inlineClass'
        });
      }
    }
  }
  
  return foundClasses;
};

interface TailwindClassMatch {
  tag: string;
  classes: string;
  position: number;
  source?: 'inlineClass' | 'styleObject';
  objectName?: string;
}

interface FoundClass {
  component: string;
  tag: string;
  classes: string;
  source?: 'inlineClass' | 'styleObject';
  objectName?: string;
}

const scanDirectory = (dir: string): Array<{ path: string; name: string; relativePath: string }> => {
  const components: Array<{ path: string; name: string; relativePath: string }> = [];
  const sourceBasePath = CONFIG.paths.sourceDir;
  
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

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const analyzeComponents = () => {
  let totalClasses = 0;
  const allFoundClasses: FoundClass[] = [];
  
    const components = scanDirectory(CONFIG.paths.sourceDir);
  
  console.log(`Found ${components.length} components to analyze`);
  
  for (const component of components) {
    const filePath = component.path;
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Analyzing component: ${component.name} (${component.relativePath})`);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const componentInfo = {
      name: component.name,
      path: component.relativePath
    };
    
        const foundClasses = extractTailwindClasses(content, filePath, componentInfo);
    
    foundClasses.forEach(({ tag, classes, source, objectName }) => {
      allFoundClasses.push({
        component: component.name,
        tag,
        classes,
        source,
        objectName
      });
      
      updateClassObject(tag, classes, componentInfo);
    });
    
    console.log(`Found ${foundClasses.length} className declarations in ${component.name}`);
    totalClasses += foundClasses.length;
  }
  
  console.log(`Total found classes: ${totalClasses}`);
  console.log('Updated classObject.ts with new entries');
  
  cleanupClassObject();
  
  return allFoundClasses;
};

const cleanupClassObject = () => {
  const valueMap: Record<string, string[]> = {};
  
  Object.entries(classObject).forEach(([key, entry]) => {
    const normalizedValue = normalizeClassString(entry.classes);
    if (!valueMap[normalizedValue]) {
      valueMap[normalizedValue] = [];
    }
    valueMap[normalizedValue].push(key);
  });
  
  Object.entries(valueMap).forEach(([normalizedValue, keys]) => {
    if (keys.length > 1) {
            const preferredKey = keys[0];
      
      if (preferredKey) {
        keys.forEach(key => {
          if (key !== preferredKey) {
            const entry = classObject[key];
            delete classObject[key];
            classObject[preferredKey] = entry;
            console.log(`Replaced duplicate key ${key} with ${preferredKey}`);
          }
        });
      }
    }
  });
  
  saveClassObject();
};

const transformComponents = () => {
  let transformedCount = 0;
  
    const components = scanDirectory(CONFIG.paths.sourceDir);
  
  for (const component of components) {
    const filePath = component.path;
    const relativeDirPath = path.dirname(component.relativePath);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Transforming component: ${component.name} (${component.relativePath})`);
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
        const quarkOutputDir = path.join(CONFIG.paths.quarkDir, relativeDirPath);
    const semanticOutputDir = path.join(CONFIG.paths.semanticDir, relativeDirPath);
    
    ensureDirectoryExists(quarkOutputDir);
    ensureDirectoryExists(semanticOutputDir);
    
    const reverseMap = buildReverseMap();
    
        const classRegexQuark = /className=["']([^"']+)["']/g;
    let matchQuark;
    let lastIndexQuark = 0;
    let transformedContentQuark = '';
    
    while ((matchQuark = classRegexQuark.exec(content)) !== null) {
      transformedContentQuark += content.substring(lastIndexQuark, matchQuark.index);
      
      const prevLines = content.substring(0, matchQuark.index).split('\n').slice(-CONFIG.tagDetection.contextLines).join('\n');
      const tag = detectTagFromContext(prevLines);
      
      const originalClasses = matchQuark[1];
      const normalizedClasses = normalizeClassString(twMerge(originalClasses));
      
      let quarkName = '';
      
      for (const [key, entry] of Object.entries(classObject)) {
        if (normalizeClassString(entry.classes) === normalizedClasses) {
          quarkName = entry.quark;
          break;
        }
      }
      
      if (!quarkName) {
        transformedContentQuark += `className="${originalClasses}"`;
      } else {
        transformedContentQuark += `className="${quarkName}"`;
      }
      
      lastIndexQuark = matchQuark.index + matchQuark[0].length;
    }
    
    transformedContentQuark += content.substring(lastIndexQuark);
    
        const classRegexSemantic = /className=["']([^"']+)["']/g;
    let matchSemantic;
    let lastIndexSemantic = 0;
    let transformedContentSemantic = '';
    
    while ((matchSemantic = classRegexSemantic.exec(content)) !== null) {
      transformedContentSemantic += content.substring(lastIndexSemantic, matchSemantic.index);
      
      const prevLines = content.substring(0, matchSemantic.index).split('\n').slice(-CONFIG.tagDetection.contextLines).join('\n');
      const tag = detectTagFromContext(prevLines);
      
      const originalClasses = matchSemantic[1];
      const normalizedClasses = normalizeClassString(twMerge(originalClasses));
      
      let semanticName = '';
      
      for (const [key, entry] of Object.entries(classObject)) {
        if (normalizeClassString(entry.classes) === normalizedClasses) {
          semanticName = entry.semantic;
          break;
        }
      }
      
      if (!semanticName) {
        transformedContentSemantic += `className="${originalClasses}"`;
      } else {
        transformedContentSemantic += `className="${semanticName}"`;
      }
      
      lastIndexSemantic = matchSemantic.index + matchSemantic[0].length;
    }
    
    transformedContentSemantic += content.substring(lastIndexSemantic);
    
        const quarkOutputPath = path.join(quarkOutputDir, `${component.name}${path.extname(component.path)}`);
    const semanticOutputPath = path.join(semanticOutputDir, `${component.name}${path.extname(component.path)}`);
    
    fs.writeFileSync(quarkOutputPath, transformedContentQuark);
    fs.writeFileSync(semanticOutputPath, transformedContentSemantic);
    
    console.log(`Transformed Quark component saved to ${quarkOutputPath}`);
    console.log(`Transformed Semantic component saved to ${semanticOutputPath}`);
    
    transformedCount++;
  }
  
  console.log(`Transformed ${transformedCount} components`);
  
  return transformedCount > 0;
};

const generateCSS = () => {
  let quarkCSS = '';
  let semanticCSS = '';
  
  Object.entries(classObject).forEach(([key, entry]) => {
    quarkCSS += `.${entry.quark} { @apply ${entry.classes}; }\n`;
    semanticCSS += `.${entry.semantic} { @apply ${entry.classes}; }\n`;
  });
  
    fs.writeFileSync(path.join(CONFIG.paths.quarkDir, `${FILE_NAMES.cssOutputQuark}.css`), quarkCSS);
  fs.writeFileSync(path.join(CONFIG.paths.semanticDir, `${FILE_NAMES.cssOutputSemantic}.css`), semanticCSS);
  
  console.log(`Generated Quark CSS saved to ${path.join(CONFIG.paths.quarkDir, `${FILE_NAMES.cssOutputQuark}.css`)}`);
  console.log(`Generated Semantic CSS saved to ${path.join(CONFIG.paths.semanticDir, `${FILE_NAMES.cssOutputSemantic}.css`)}`);
  
  return { quarkCSS, semanticCSS };
};

const command = process.argv[2];

switch (command) {
  case 'analyze':
    console.log('Analyzing components...');
    const classes = analyzeComponents();
    console.log(`Found ${classes?.length || 0} className declarations in total`);
    break;
    
  case 'generate':
    console.log('Generating CSS...');
    const css = generateCSS();
    console.log('CSS generated successfully!');
    
    console.log(`Total class entries: ${Object.keys(classObject).length}`);
    break;
    
  case 'transform':
    console.log('Transforming components with class names...');
    transformComponents();
    break;
    
  default:
    console.log(`
Object UI Generator CLI

Commands:
  analyze   - Analyze components and update class object
  generate  - Generate CSS from class object
  transform - Transform components to use class names
    `);
} 