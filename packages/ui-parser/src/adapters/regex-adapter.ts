import fs from 'fs';
import path from 'path';
import { ClassExtractorAdapter } from './base-adapter';
import { EnhancedClassEntry } from '../core/types';
import { CONFIG } from '../config';

// Паттерны для поиска классов в различных контекстах
const CLASS_PATTERNS = {
  // JSX className атрибуты
  jsxClassName: /className=["']([^"']+)["']/g,
  
  // Объявления констант с классами
  constClassName: /className:\s*["']([^"']+)["']/g,
  
  // Объекты конфигурации с классами
  configClassName: /\bclassName:\s*["']([^"']+)["']/g,
  
  // Динамические классы с clsx/cn
  dynamicClassName: /className=\{(?:clsx|cn)\(\s*(?:['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])*)\s*\)\}/g,
  
  // Шаблонные строки
  templateClassName: /className=\{`([^`]+)`\}/g,
} as const;

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
      const content = fs.readFileSync(componentPath, 'utf-8');
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const componentDir = path.dirname(componentPath);
      
      const classEntries: EnhancedClassEntry[] = [];
      
      // Обрабатываем все паттерны поиска классов
      for (const [patternName, pattern] of Object.entries(CLASS_PATTERNS)) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const classes = match[1];
          
          // Определяем тип элемента
          const elementType = this.determineElementType(content, match.index);
          
          // Создаем запись о классе
          const classEntry: EnhancedClassEntry = {
            quark: this.generateQuarkName(classes),
            semantic: this.generateSemanticName(componentName, elementType, classes),
            classes,
            componentName,
            elementType,
            variants: {},
            isPublic: true,
            components: {
              [componentName]: {
                path: componentDir,
                name: componentName
              }
            }
          };
          
          classEntries.push(classEntry);
          console.log(`Found classes using ${patternName}: ${classes}`);
        }
      }
      
      console.log(`Found ${classEntries.length} class entries with regex`);
      return classEntries;
    } catch (error) {
      console.error(`Error analyzing component with regex:`, error);
      return [];
    }
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
   * Генерирует quark имя
   */
  private generateQuarkName(classes: string): string {
    const normalizedClasses = this.normalizeClassString(classes);
    
    const quarkId = normalizedClasses
      .split(' ')
      .map(cls => {
        const parts = cls.split(':');
        const baseCls = parts[parts.length - 1];
        
        const cleanCls = baseCls
          .replace(/[\[\]\/\(\)]/g, '')
          .replace(/[&>~=]/g, '')
          .replace(/[^a-zA-Z0-9-_]/g, '');
        
        if (cleanCls.match(/^\d/)) {
          return cleanCls.replace(/[^\d]/g, '');
        }
        
        return cleanCls
          .split('-')
          .map(word => word[0] || '')
          .join('')
          .toLowerCase();
      })
      .join('');

    return `${CONFIG.classNames.quarkPrefix}${quarkId}`;
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
        
        return baseCls
          .replace(/[\[\]\/\(\)]/g, '-')
          .replace(/[&>~=]/g, '')
          .replace(/[^a-zA-Z0-9-_]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      })
      .filter(Boolean)
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