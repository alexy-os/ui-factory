import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import * as ts from 'typescript';

interface SemanticRendererOptions {
  semanticMapPath?: string;
  outputDir?: string;
}

export class SemanticRenderer {
  private semanticMap: Record<string, string> = {};
  private outputDir: string;
  
  constructor(options: SemanticRendererOptions = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'public');
    this.semanticMapPath = options.semanticMapPath || path.join(process.cwd(), 'src/semantic/semantic-map.json');
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
      classNames.forEach(className => {
        // Если есть семантический аналог, используем его
        if (this.semanticMap[className]) {
          newClassNames.push(this.semanticMap[className]);
        } else {
          newClassNames.push(className);
        }
      });
      
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
    // Рендерим компонент в HTML
    const reactHtml = ReactDOMServer.renderToString(
      React.createElement(component, props)
    );
    
    // Трансформируем классы
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