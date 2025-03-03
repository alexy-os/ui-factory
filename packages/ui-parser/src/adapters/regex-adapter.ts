import fs from 'fs';
import path from 'path';
import { ClassExtractorAdapter } from './base-adapter';
import { EnhancedClassEntry } from '../core/types';
import { CONFIG } from '../config';

/**
 * Адаптер для извлечения классов через регулярные выражения
 */
export class RegexExtractorAdapter implements ClassExtractorAdapter {
  readonly name = 'Regex Extractor';
  
  /**
   * Проверяет, поддерживает ли адаптер данный компонент
   */
  supportsComponent(componentPath: string): boolean {
    const ext = path.extname(componentPath).toLowerCase();
    return ['.tsx', '.jsx', '.js', '.ts'].includes(ext);
  }
  
  /**
   * Анализирует компонент и извлекает классы через регулярные выражения
   */
  async extractClasses(componentPath: string): Promise<EnhancedClassEntry[]> {
    console.log(`Analyzing component with Regex adapter: ${path.basename(componentPath)}`);
    
    try {
      // Читаем содержимое файла
      const content = fs.readFileSync(componentPath, 'utf-8');
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const componentDir = path.dirname(componentPath);
      
      // Находим все классы с помощью регулярного выражения
      const classEntries: EnhancedClassEntry[] = [];
      
      // Регулярное выражение для поиска className в JSX
      const classRegex = /className=["']([^"']+)["']/g;
      let match;
      
      while ((match = classRegex.exec(content)) !== null) {
        const classes = match[1];
        
        // Определяем тип элемента (приблизительно)
        const elementType = this.determineElementType(content, match.index);
        
        // Создаем запись о классе
        const classEntry: EnhancedClassEntry = {
          quark: this.generateQuarkName(classes),
          semantic: this.generateSemanticName(componentName, elementType, classes),
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
      }
      
      // Ищем классы в константах
      this.extractClassesFromConstants(content, componentName, componentDir, classEntries);
      
      console.log(`Found ${classEntries.length} class entries with regex`);
      return classEntries;
    } catch (error) {
      console.error(`Error analyzing component with regex:`, error);
      return [];
    }
  }
  
  /**
   * Извлекает классы из констант
   */
  private extractClassesFromConstants(
    content: string, 
    componentName: string, 
    componentDir: string, 
    classEntries: EnhancedClassEntry[]
  ): void {
    // Регулярное выражение для поиска констант с классами
    const constRegex = /const\s+(\w+)\s*=\s*["']([^"']+)["']/g;
    let match;
    
    while ((match = constRegex.exec(content)) !== null) {
      const constName = match[1];
      const constValue = match[2];
      
      // Проверяем, похоже ли значение на классы Tailwind
      if (this.looksLikeTailwindClasses(constValue)) {
        // Определяем тип элемента на основе имени константы
        const elementType = this.determineElementTypeFromConstName(constName);
        
        // Создаем запись о классе
        const classEntry: EnhancedClassEntry = {
          quark: this.generateQuarkName(constValue),
          semantic: this.generateSemanticName(componentName, elementType, constValue),
          classes: constValue,
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
      }
    }
  }
  
  /**
   * Определяет, похожа ли строка на классы Tailwind
   */
  private looksLikeTailwindClasses(str: string): boolean {
    // Проверяем наличие типичных классов Tailwind
    const tailwindPatterns = [
      /\b(flex|grid|block|inline|hidden)\b/,
      /\b(w-|h-|m-|p-|text-|bg-|border-)/,
      /\b(rounded|shadow|transition|transform)/
    ];
    
    return tailwindPatterns.some(pattern => pattern.test(str));
  }
  
  /**
   * Определяет тип элемента на основе имени константы
   */
  private determineElementTypeFromConstName(constName: string): string {
    const elementTypes = [
      'div', 'span', 'button', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'img', 'input', 'form'
    ];
    
    const lowerConstName = constName.toLowerCase();
    
    // Проверяем, содержит ли имя константы тип элемента
    for (const type of elementTypes) {
      if (lowerConstName.includes(type)) {
        return type;
      }
    }
    
    // Определяем тип на основе общих шаблонов именования
    if (lowerConstName.includes('button') || lowerConstName.includes('btn')) {
      return 'button';
    } else if (lowerConstName.includes('container') || lowerConstName.includes('wrapper')) {
      return 'div';
    } else if (lowerConstName.includes('text') || lowerConstName.includes('label')) {
      return 'span';
    } else if (lowerConstName.includes('link')) {
      return 'a';
    } else if (lowerConstName.includes('heading') || lowerConstName.includes('title')) {
      return 'h2';
    } else if (lowerConstName.includes('paragraph')) {
      return 'p';
    }
    
    // По умолчанию div
    return 'div';
  }
  
  /**
   * Определяет тип элемента на основе контекста
   */
  private determineElementType(content: string, position: number): string {
    // Ищем открывающий тег перед позицией className
    const beforeContent = content.substring(0, position);
    const tagMatch = beforeContent.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s|>)[^<]*$/);
    
    if (tagMatch) {
      return tagMatch[1].toLowerCase();
    }
    
    // По умолчанию div
    return 'div';
  }
  
  /**
   * Генерирует кварк-имя
   */
  private generateQuarkName(classes: string): string {
    const normalizedClasses = this.normalizeClassString(classes);
    
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
  }
  
  /**
   * Генерирует семантическое имя
   */
  private generateSemanticName(componentName: string, elementType: string, classes: string): string {
    const normalizedClasses = this.normalizeClassString(classes);
    const classIdentifier = normalizedClasses
      .split(' ')
      .map(cls => {
        const baseCls = cls.split(':').pop() || '';
        return baseCls.replace(/[\[\]]/g, '');
      })
      .join('-');

    return `${CONFIG.classNames.semanticPrefix}${componentName.toLowerCase()}-${elementType}${classIdentifier ? `-${classIdentifier}` : ''}`;
  }
  
  /**
   * Нормализует строку классов
   */
  private normalizeClassString(classString: string): string {
    return classString.split(' ').sort().join(' ');
  }
} 