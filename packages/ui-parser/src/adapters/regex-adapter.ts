import fs from 'fs';
import path from 'path';
import { ClassExtractorAdapter } from './base-adapter';
import { EnhancedClassEntry } from '../core/types';
import { CONFIG } from '../config';
import { deduplicateEntries } from '../utils/deduplication';

// Определяем типы для паттернов
type PatternContextType = 'jsx' | 'const' | 'config' | 'dynamic' | 'template';

interface PatternConfig {
  pattern: RegExp;
  contextType: PatternContextType;
}

// Паттерны для поиска классов в различных контекстах
const CLASS_PATTERNS: Record<string, PatternConfig> = {
  // JSX className атрибуты
  jsxClassName: {
    pattern: /className=["']([^"']+)["']/g,
    contextType: 'jsx'
  },
  
  // Объявления констант с классами
  constClassName: {
    pattern: /className:\s*["']([^"']+)["']/g,
    contextType: 'const'
  },
  
  // Объекты конфигурации с классами
  configClassName: {
    pattern: /\bclassName:\s*["']([^"']+)["']/g,
    contextType: 'config'
  },
  
  // Динамические классы с clsx/cn
  dynamicClassName: {
    pattern: /className=\{(?:clsx|cn)\(\s*(?:['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])*)\s*\)\}/g,
    contextType: 'dynamic'
  },
  
  // Шаблонные строки
  templateClassName: {
    pattern: /className=\{`([^`]+)`\}/g,
    contextType: 'template'
  },

  // Паттерн для tailwind-variants
  tvVariants: {
    pattern: /tv\(\s*\{([\s\S]*?)\}\s*\)/gs, // g и s флаги для многострочного поиска
    contextType: 'config'
  }
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
    try {
      const content = fs.readFileSync(componentPath, 'utf-8');
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const componentDir = path.dirname(componentPath);
      
      const classEntries: EnhancedClassEntry[] = [];
      
      // Обработка tv конфигурации
      const tvMatches = content.match(/tv\(\s*\{([\s\S]*?)\}\s*\)/g);
      if (tvMatches) {
        for (const tvMatch of tvMatches) {
          // Извлекаем base классы
          const baseMatch = tvMatch.match(/base:\s*["']([^"']+)["']/);
          if (baseMatch) {
            const baseClasses = baseMatch[1];
            classEntries.push(this.createClassEntry(baseClasses, componentName, componentDir, 'div'));
          }

          // Извлекаем все варианты из variants объекта
          const variantsMatch = tvMatch.match(/variants:\s*({[\s\S]*?}(?=\s*[,}]\s*\}))/);
          if (variantsMatch) {
            const variantsStr = variantsMatch[1];
            
            // Находим все группы вариантов (variant, size и т.д.)
            const variantGroups = variantsStr.matchAll(/(\w+):\s*{([^}]+)}/g);
            
            for (const [_, groupName, groupContent] of variantGroups) {
              // Для каждой группы находим все значения
              const valueMatches = groupContent.matchAll(/(\w+):\s*["']([^"']+)["']/g);
              
              for (const [__, valueName, classes] of valueMatches) {
                classEntries.push(
                  this.createClassEntry(
                    classes,
                    componentName,
                    componentDir,
                    'div',
                    { [groupName]: valueName }
                  )
                );
              }
            }
          }
        }
      }

      // Обработка обычных className
      for (const [patternName, config] of Object.entries(CLASS_PATTERNS)) {
        const { pattern, contextType } = config;
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (patternName !== 'tvVariants') { // Пропускаем tv паттерн, так как уже обработали
            const classes = match[1];
            const elementType = this.determineElementType(content, match.index, contextType);
            classEntries.push(this.createClassEntry(classes, componentName, componentDir, elementType));
          }
        }
      }

      const uniqueEntries = deduplicateEntries(classEntries);
      return uniqueEntries;
    } catch (error) {
      console.error(`Error analyzing component with regex:`, error);
      return [];
    }
  }
  
  private createClassEntry(
    classes: string,
    componentName: string,
    componentDir: string,
    elementType: string,
    variants: Record<string, string> = {}
  ): EnhancedClassEntry {
    return {
      quark: this.generateQuarkName(classes),
      semantic: this.generateSemanticName(componentName, elementType, classes),
      classes: classes.trim(),
      componentName,
      elementType,
      variants,
      isPublic: true,
      components: {
        [componentName]: {
          path: componentDir,
          name: componentName
        }
      }
    };
  }
  
  /**
   * Определяет тип элемента на основе контекста
   */
  private determineElementType(content: string, position: number, contextType: PatternContextType): string {
    // Для JSX контекста и шаблонных строк ищем ближайший открывающий тег
    if (contextType === 'jsx' || contextType === 'template' || contextType === 'dynamic') {
      const beforeContent = content.substring(0, position);
      const tagMatch = beforeContent.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s|>)[^<]*$/);
      
      if (tagMatch) {
        return tagMatch[1].toLowerCase();
      }
    }
    
    // Для констант и конфигураций используем контекстное определение
    if (contextType === 'const' || contextType === 'config') {
      const beforeContent = content.substring(0, position);
      // Ищем в ближайшем контексте (до 200 символов)
      const contextWindow = beforeContent.slice(-200);
      
      if (contextWindow.match(/Button|btn|button/i)) return 'button';
      if (contextWindow.match(/Link|anchor|a>/i)) return 'a';
      if (contextWindow.match(/heading|h[1-6]/i)) return 'h2';
      if (contextWindow.match(/paragraph|p>/i)) return 'p';
      if (contextWindow.match(/image|img/i)) return 'img';
    }
    
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