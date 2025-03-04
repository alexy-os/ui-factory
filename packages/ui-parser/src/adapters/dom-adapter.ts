import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ClassExtractorAdapter } from './base-adapter';
import { EnhancedClassEntry } from '../core/types';
import { CONFIG } from '../config';
import { deduplicateEntries } from '../utils/deduplication';

const execAsync = promisify(exec);

/**
 * Адаптер для извлечения классов через DOM
 */
export class DOMExtractorAdapter implements ClassExtractorAdapter {
  readonly name = 'DOM Extractor';
  
  /**
   * Проверяет, поддерживает ли адаптер данный компонент
   */
  supportsComponent(componentPath: string): boolean {
    const ext = path.extname(componentPath).toLowerCase();
    return ['.tsx', '.jsx'].includes(ext);
  }
  
  /**
   * Анализирует компонент и извлекает классы через DOM
   */
  async extractClasses(componentPath: string): Promise<EnhancedClassEntry[]> {
    //console.log(`Analyzing component with DOM adapter: ${path.basename(componentPath)}`);
    
    try {
      const document = await this.renderComponentToDOM(componentPath);
      
      if (document) {
        const entries = this.extractClassesFromDOM(document, componentPath);
        console.log(`Found ${entries.length} raw class entries in rendered DOM`);
        
        // Дедупликация записей
        const uniqueEntries = deduplicateEntries(entries);
        
        console.log(`After deduplication: ${uniqueEntries.length} unique class entries`);
        return uniqueEntries;
      }
      
      console.log('Failed to render component');
      return [];
    } catch (error) {
      console.error(`Error analyzing component:`, error);
      return [];
    }
  }
  
  /**
   * Рендерит компонент в DOM
   */
  private async renderComponentToDOM(componentPath: string): Promise<Document | null> {
    try {
      const componentName = path.basename(componentPath, path.extname(componentPath));
      const tempDir = path.resolve('./temp');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Создаем package.json для указания типа модуля
      const packageJsonPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(packageJsonPath, JSON.stringify({ 
        "type": "module",
        "private": true
      }));
      
      // Создаем временный файл для рендеринга с расширением .js
      const tempFile = path.join(tempDir, `render-${componentName}.js`);
      
      // Создаем содержимое файла для рендеринга с использованием ESM синтаксиса
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
      const packageManager = this.detectPackageManager();
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
          encoding: 'utf-8',
          cwd: tempDir // Устанавливаем рабочую директорию в tempDir, чтобы package.json был найден
        });
        
        // Удаляем временные файлы
        fs.unlinkSync(tempFile);
        fs.unlinkSync(packageJsonPath);
        
        if (stderr && !stdout) {
          console.error(`Error rendering ${componentName}:`, stderr);
          return null;
        }
        
        // Создаем DOM из HTML
        const dom = new JSDOM(`<!DOCTYPE html><html><body>${stdout}</body></html>`);
        return dom.window.document;
      } catch (error) {
        console.error(`Error executing render script for ${componentName}:`, error);
        
        // Удаляем временные файлы даже в случае ошибки
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        if (fs.existsSync(packageJsonPath)) {
          fs.unlinkSync(packageJsonPath);
        }
        
        return null;
      }
    } catch (error) {
      console.error(`Failed to render component:`, error);
      return null;
    }
  }
  
  /**
   * Извлекает классы из DOM
   */
  private extractClassesFromDOM(document: Document, componentPath: string): EnhancedClassEntry[] {
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
        quark: this.generateQuarkName(classes),
        semantic: this.generateSemanticName(componentName, elementType, classes), // Передаем classes
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
  }
  
  /**
   * Генерирует quark имя
   */
  private generateQuarkName(classes: string): string {
    const normalizedClasses = this.normalizeClassString(classes);
    
    const quarkId = normalizedClasses
      .split(' ')
      .map(cls => {
        // Убираем модификаторы (hover:, focus: и т.д.)
        const parts = cls.split(':');
        const baseCls = parts[parts.length - 1];
        
        // Очищаем от специальных символов и квадратных скобок
        const cleanCls = baseCls
          .replace(/[\[\]\/\(\)]/g, '') // удаляем [], /, ()
          .replace(/[&>~=]/g, '')       // удаляем специальные CSS селекторы
          .replace(/[^a-zA-Z0-9-_]/g, ''); // оставляем только буквы, цифры, дефис и подчеркивание
        
        if (cleanCls.match(/^\d/)) {
          // Если начинается с цифры, оставляем только цифры
          return cleanCls.replace(/[^\d]/g, '');
        }
        
        // Для остальных случаев берем первые буквы каждого слова
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
        // Убираем модификаторы (например, hover:, focus:)
        const baseCls = cls.split(':').pop() || '';
        
        // Очищаем от специальных символов
        return baseCls
          .replace(/[\[\]\/\(\)]/g, '-') // заменяем [], /, () на дефис
          .replace(/[&>~=]/g, '')        // удаляем специальные CSS селекторы
          .replace(/[^a-zA-Z0-9-_]/g, '') // оставляем только буквы, цифры, дефис и подчеркивание
          .replace(/-+/g, '-')           // заменяем множественные дефисы на один
          .replace(/^-|-$/g, '');        // убираем дефисы в начале и конце
      })
      .filter(Boolean) // убираем пустые строки
      .join('-');

    return `${CONFIG.classNames.semanticPrefix}${componentName.toLowerCase()}-${elementType}${classIdentifier ? `-${classIdentifier}` : ''}`;
  }
  
  /**
   * Нормализует строку классов
   */
  private normalizeClassString(classString: string): string {
    return classString.split(' ').sort().join(' ');
  }
  
  /**
   * Определяет текущий пакетный менеджер
   */
  private detectPackageManager(): string {
    if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
    if (fs.existsSync('yarn.lock')) return 'yarn';
    if (fs.existsSync('bun.lockb')) return 'bun';
    return 'npm'; // По умолчанию npm
  }
} 