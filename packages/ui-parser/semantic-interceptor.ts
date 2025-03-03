import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom'; // Для работы с DOM вне браузера

// Расширенная структура для хранения информации о классах
type EnhancedClassEntry = {
  quark: string;
  semantic: string;
  classes: string;
  componentName: string;     // Название компонента
  componentPath: string;     // Путь к компоненту
  elementType: string;       // HTML тег
  variants: {               // Варианты компонента (если есть)
    size?: string;
    color?: string;
    state?: string;
    [key: string]: string | undefined;
  };
  role?: string;             // Роль элемента (header, footer, etc.)
  isPublic: boolean;         // Видимый элемент или вспомогательный
};

// Функция для анализа компонента Shadcn
const analyzeShadcnComponent = async (componentPath: string): Promise<EnhancedClassEntry[]> => {
  // Извлекаем базовую информацию о компоненте
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const componentDir = path.dirname(componentPath);
  
  // Читаем содержимое файла
  const content = fs.readFileSync(componentPath, 'utf-8');
  
  // Извлекаем варианты из cva или из variants, если они есть
  const variants = extractVariantsFromComponent(content);
  
  // Создаем временный HTML для анализа с JSDOM
  const tempHtml = await renderComponentToHtml(componentPath);
  const dom = new JSDOM(tempHtml);
  const document = dom.window.document;
  
  const classEntries: EnhancedClassEntry[] = [];
  
  // Находим все элементы с классами
  document.querySelectorAll('[class]').forEach(element => {
    const classes = element.getAttribute('class') || '';
    const elementType = element.tagName.toLowerCase();
    
    // Определяем роль элемента на основе его положения и атрибутов
    const role = determineElementRole(element, componentName);
    
    // Определяем, является ли элемент публичным или вспомогательным
    const isPublic = isPublicElement(element, componentName);
    
    // Создаем объект с подробной информацией
    const classEntry: EnhancedClassEntry = {
      quark: generateQuarkName(classes),
      semantic: generateEnhancedSemanticName({
        componentName,
        elementType,
        role,
        variants,
        isPublic
      }),
      classes,
      componentName,
      componentPath: componentDir,
      elementType,
      variants,
      role,
      isPublic
    };
    
    classEntries.push(classEntry);
  });
  
  return classEntries;
};

// Генерирует улучшенное семантическое имя на основе контекста
const generateEnhancedSemanticName = (params: {
  componentName: string;
  elementType: string;
  role?: string;
  variants: any;
  isPublic: boolean;
}): string => {
  const { componentName, elementType, role, variants, isPublic } = params;
  
  // Если это вспомогательный элемент, добавляем суффикс
  const visibilityPrefix = isPublic ? '' : 'internal-';
  
  // Базовое имя на основе компонента, роли и типа элемента
  let baseName = `${visibilityPrefix}${componentName.toLowerCase()}`;
  
  // Добавляем роль, если она есть
  if (role) {
    baseName += `-${role}`;
  }
  
  // Если это не сам компонент, а вложенный элемент, добавляем его тип
  if (elementType !== componentName.toLowerCase()) {
    baseName += `-${elementType}`;
  }
  
  // Добавляем варианты, если они есть
  const variantParts: string[] = [];
  
  if (variants.size) variantParts.push(`size-${variants.size}`);
  if (variants.color) variantParts.push(`color-${variants.color}`);
  if (variants.state) variantParts.push(`state-${variants.state}`);
  
  // Объединяем всё в одно семантическое имя
  return variantParts.length > 0 
    ? `${baseName}-${variantParts.join('-')}` 
    : baseName;
};

// Здесь будут другие вспомогательные функции...
