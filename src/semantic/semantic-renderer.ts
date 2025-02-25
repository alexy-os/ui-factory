import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import * as ts from 'typescript';

interface SemanticRendererOptions {
  semanticMapPath?: string;
  outputDir?: string;
  componentsDir?: string;
}

export class SemanticRenderer {
  private semanticMap: Record<string, string> = {};
  private outputDir: string;
  private semanticMapPath: string;
  private componentsDir: string;
  
  constructor(options: SemanticRendererOptions = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'public');
    this.semanticMapPath = options.semanticMapPath || path.join(process.cwd(), 'src/semantic/semantic-map.json');
    this.componentsDir = options.componentsDir || path.join(process.cwd(), 'src/semantic/components');
  }
  
  async initialize(): Promise<void> {
    // Загружаем семантическую карту
    const mapData = await fs.readFile(this.semanticMapPath, 'utf-8');
    const semanticMapJson = JSON.parse(mapData);
    
    // Преобразуем карту в плоскую структуру для удобного поиска
    semanticMapJson.components.forEach((component: any) => {
      Object.entries(component.classes).forEach(([semanticClass, tailwindClasses]) => {
        this.semanticMap[tailwindClasses as string] = semanticClass;
      });
    });
  }
  
  private transformClassNames(html: string): string {
    // Используем DOM-парсер для корректной работы с HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Находим все элементы с классами
    const elementsWithClasses = document.querySelectorAll('[class]');
    
    elementsWithClasses.forEach(element => {
      const classNames = element.getAttribute('class')?.split(' ') || [];
      const newClassNames: string[] = [];
      
      // Проверяем каждый класс
      for (let i = 0; i < classNames.length; i++) {
        const className = classNames[i];
        
        // Проверяем составные классы (группы классов, которые должны заменяться вместе)
        let found = false;
        for (const [tailwindGroup, semanticClass] of Object.entries(this.semanticMap)) {
          const groupClasses = tailwindGroup.split(' ');
          
          // Проверяем, совпадает ли группа классов
          if (groupClasses.every((cls, index) => classNames[i + index] === cls)) {
            newClassNames.push(semanticClass);
            i += groupClasses.length - 1; // Пропускаем обработанные классы
            found = true;
            break;
          }
        }
        
        // Если не нашли соответствия, оставляем оригинальный класс
        if (!found) {
          newClassNames.push(className);
        }
      }
      
      // Обновляем атрибут class
      element.setAttribute('class', newClassNames.join(' '));
    });
    
    return dom.serialize();
  }
  
  async renderComponent(
    component: React.ComponentType,
    props: Record<string, any> = {},
    outputPath: string
  ): Promise<void> {
    // Создаем компонент с семантическими пропсами
    const semanticProps = { ...props, semantic: true };
    
    // Рендерим компонент в HTML
    const reactHtml = ReactDOMServer.renderToString(
      React.createElement(component, semanticProps)
    );
    
    // Трансформируем оставшиеся классы
    const transformedHtml = this.transformClassNames(reactHtml);
    
    // Создаем полный HTML документ
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Semantic UI</title>
          <link rel="stylesheet" href="/style-semantic.css">
        </head>
        <body>
          <div id="root">${transformedHtml}</div>
        </body>
      </html>
    `;
    
    // Создаем директорию, если не существует
    const dirPath = path.dirname(path.join(this.outputDir, outputPath));
    await fs.mkdir(dirPath, { recursive: true });
    
    // Записываем файл
    await fs.writeFile(path.join(this.outputDir, outputPath), fullHtml, 'utf-8');
    
    console.log(`✅ Rendered ${outputPath}`);
  }

  // Добавляем метод для анализа компонента через AST
  private async analyzeComponent(componentPath: string): Promise<Record<string, string>> {
    const content = await fs.readFile(componentPath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      componentPath,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    
    const dynamicClassMappings: Record<string, string> = {};
    
    // Функция для обхода AST
    function visit(node: ts.Node) {
      // Ищем вызовы cn(), clsx() и т.д.
      if (ts.isCallExpression(node) && 
          (node.expression.getText() === 'cn' || node.expression.getText() === 'clsx')) {
        
        // Анализируем аргументы
        node.arguments.forEach(arg => {
          if (ts.isStringLiteral(arg)) {
            const classString = arg.text;
            const classes = classString.split(' ');
            
            classes.forEach(className => {
              // Проверяем, есть ли семантический аналог
              if (this.semanticMap[className]) {
                dynamicClassMappings[className] = this.semanticMap[className];
              }
            });
          }
        });
      }
      
      ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
    return dynamicClassMappings;
  }
} 