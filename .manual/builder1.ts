import { BuilderConfig, PageConfig } from './types';
import { ConfigManager } from './config';
import { StyleProcessor } from './styles';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import React from 'react';

export class StaticBuilder {
  private config: BuilderConfig;
  private configManager: ConfigManager;
  private styleProcessor: StyleProcessor;

  constructor(config?: Partial<BuilderConfig>) {
    this.configManager = new ConfigManager(config);
    this.config = this.configManager.getConfig();
    this.styleProcessor = new StyleProcessor();
    this.configManager.validateConfig();
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private async generateHtml(page: PageConfig): Promise<string> {
    const component = page.component;
    const props = page.props || {};
    
    const content = ReactDOMServer.renderToString(
      React.createElement(component, props)
    );

    const styles = [
      ...(this.config.defaultStyles || []),
      ...(page.styles || []),
    ].map(style => `<link rel="stylesheet" href="${style}">`).join('\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${styles}
        </head>
        <body>
          <div id="root">${content}</div>
        </body>
      </html>
    `;
  }

  async build(): Promise<void> {
    await this.ensureDirectoryExists(this.config.outDir);

    // Обработка стилей
    const styleFile = await this.styleProcessor.bundleStyles(
      path.resolve(process.cwd(), 'src/index.css'),
      this.config.outDir
    );

    // Добавляем обработанный файл стилей в defaultStyles
    this.config.defaultStyles = [styleFile];

    // Генерация HTML страниц
    for (const page of this.config.templates) {
      const html = await this.generateHtml(page);
      const outputPath = path.join(this.config.outDir, page.path);
      
      await this.ensureDirectoryExists(path.dirname(outputPath));
      await fs.writeFile(outputPath, html, 'utf-8');
    }
  }
} 