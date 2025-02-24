import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';
import glob from 'fast-glob';

interface ComponentInfo {
  name: string;
  base: string;
  variants: Record<string, Record<string, string>>;
}

export class StyleConverter {
  private async getUIComponents(): Promise<string[]> {
    const componentsJson = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'components.json'), 'utf-8')
    );
    
    // Получаем путь к UI компонентам из aliases
    const uiPath = componentsJson.aliases.ui.replace('@/', 'src/');
    
    // Находим все tsx файлы в директории компонентов
    const files = await glob(`${uiPath}/**/*.tsx`);
    return files;
  }

  private createSemanticClassName(
    componentName: string,
    variantType: string,
    variantValue: string
  ): string {
    // Преобразуем размеры
    if (variantType === 'size') {
      if (variantValue === 'default') return `${componentName}-md`;
      return `${componentName}-${variantValue}`;
    }
    
    // Для остальных вариантов просто объединяем имя и значение
    if (variantType === 'variant') {
      return `${componentName}-${variantValue}`;
    }

    // Для любых других типов вариантов
    return `${componentName}-${variantType}-${variantValue}`;
  }

  private parseCVA(sourceFile: ts.SourceFile): ComponentInfo[] {
    const components: ComponentInfo[] = [];

    // Функция для обхода AST
    function visit(node: ts.Node) {
      if (ts.isVariableDeclaration(node) && node.initializer) {
        // Проверяем, что это cva вызов
        if (node.name.getText().endsWith('Variants') &&
            ts.isCallExpression(node.initializer) && 
            node.initializer.expression.getText() === 'cva' &&
            node.initializer.arguments.length >= 2) {
          
          const componentName = node.name.getText().replace('Variants', '');
          const [baseClasses, config] = node.initializer.arguments;
          
          // Проверяем и извлекаем базовые классы
          if (!ts.isStringLiteral(baseClasses)) return;
          const base = baseClasses.text;

          const variants: Record<string, Record<string, string>> = {};

          // Проверяем и извлекаем варианты
          if (ts.isObjectLiteralExpression(config)) {
            const variantsProperty = config.properties.find(
              p => ts.isPropertyAssignment(p) && p.name.getText() === 'variants'
            );

            if (variantsProperty && ts.isPropertyAssignment(variantsProperty) &&
                ts.isObjectLiteralExpression(variantsProperty.initializer)) {
              
              variantsProperty.initializer.properties.forEach(prop => {
                if (ts.isPropertyAssignment(prop) && 
                    ts.isObjectLiteralExpression(prop.initializer)) {
                  const variantType = prop.name.getText();
                  variants[variantType] = {};

                  prop.initializer.properties.forEach(valueProp => {
                    if (ts.isPropertyAssignment(valueProp) && 
                        ts.isStringLiteral(valueProp.initializer)) {
                      const variantValue = valueProp.name.getText();
                      const classes = valueProp.initializer.text;
                      variants[variantType][variantValue] = classes;
                    }
                  });
                }
              });
            }
          }

          components.push({
            name: componentName,
            base,
            variants
          });
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return components;
  }

  async generateSemanticMap(): Promise<void> {
    const componentFiles = await this.getUIComponents();
    const components: ComponentInfo[] = [];

    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      components.push(...this.parseCVA(sourceFile));
    }

    const semanticMap = {
      components: components.map(component => ({
        name: component.name,
        classes: {
          [component.name]: component.base,
          ...Object.entries(component.variants).reduce((acc, [type, values]) => {
            Object.entries(values).forEach(([value, classes]) => {
              acc[this.createSemanticClassName(component.name, type, value)] = classes;
            });
            return acc;
          }, {} as Record<string, string>)
        }
      }))
    };

    // 1. Сохраняем карту компонентов
    const semanticMapPath = path.join(process.cwd(), 'src/semantic/semantic-map.json');
    await fs.writeFile(
      semanticMapPath,
      JSON.stringify(semanticMap, null, 2)
    );

    // 2. Генерируем исходный CSS с @apply
    const sourceCssPath = path.join(process.cwd(), 'src/semantic/style-semantic.source.css');
    await fs.writeFile(sourceCssPath, this.generateCSS(semanticMap));

    console.log('✨ Semantic map and source CSS generated successfully!');
  }

  private generateCSS(semanticMap: any): string {
    let css = `
/* Tailwind base and utilities */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 240 10% 3.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 240 10% 3.9%;
      --primary: 346.8 77.2% 49.8%;
      --primary-foreground: 355.7 100% 97.3%;
      --secondary: 240 4.8% 95.9%;
      --secondary-foreground: 240 5.9% 10%;
      --muted: 240 4.8% 95.9%;
      --muted-foreground: 240 3.8% 46.1%;
      --accent: 240 4.8% 95.9%;
      --accent-foreground: 240 5.9% 10%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 5.9% 90%;
      --input: 240 5.9% 90%;
      --ring: 346.8 77.2% 49.8%;
      --radius: 0.75rem;
      --chart-1: 12 76% 61%;
      --chart-2: 173 58% 39%;
      --chart-3: 197 37% 24%;
      --chart-4: 43 74% 66%;
      --chart-5: 27 87% 67%;
    }
  
    .dark {
      --background: 20 14.3% 4.1%;
      --foreground: 0 0% 95%;
      --card: 24 9.8% 10%;
      --card-foreground: 0 0% 95%;
      --popover: 0 0% 9%;
      --popover-foreground: 0 0% 95%;
      --primary: 346.8 77.2% 49.8%;
      --primary-foreground: 355.7 100% 97.3%;
      --secondary: 240 3.7% 15.9%;
      --secondary-foreground: 0 0% 98%;
      --muted: 0 0% 15%;
      --muted-foreground: 240 5% 64.9%;
      --accent: 12 6.5% 15.1%;
      --accent-foreground: 0 0% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 85.7% 97.3%;
      --border: 240 3.7% 15.9%;
      --input: 240 3.7% 15.9%;
      --ring: 346.8 77.2% 49.8%;
      --chart-1: 220 70% 50%;
      --chart-2: 160 60% 45%;
      --chart-3: 30 80% 55%;
      --chart-4: 280 65% 60%;
      --chart-5: 340 75% 55%;
    }
  }

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Semantic Component Classes */\n`;

    semanticMap.components.forEach((component: any) => {
      css += `\n/* ${component.name.toUpperCase()} */\n`;
      Object.entries(component.classes).forEach(([className, styles]) => {
        css += `
.${className} {
  @apply ${styles};
}\n`;
      });
    });

    return css;
  }
} 