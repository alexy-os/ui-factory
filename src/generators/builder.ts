import { BuilderConfig, PageConfig } from './types';
import { ConfigManager } from './config';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import React from 'react';

export class StaticBuilder {
  private config: BuilderConfig;
  private configManager: ConfigManager;
  private templateCache: Map<string, string> = new Map();

  constructor(config?: Partial<BuilderConfig>) {
    this.configManager = new ConfigManager(config);
    this.config = this.configManager.getConfig();
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
    const cacheKey = `${page.path}-${JSON.stringify(page.props)}`;
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    const component = page.component;
    const props = page.props || {};
    
    const content = ReactDOMServer.renderToString(
      React.createElement(component, props)
    );

    const html = `
      <!DOCTYPE html>
      <html lang="en" class="light">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>UI Factory</title>
          <link rel="stylesheet" href="style.css">
        </head>
        <body class="antialiased bg-background text-foreground">
          <div id="root">${content}</div>
        </body>
      </html>
    `;

    this.templateCache.set(cacheKey, html);
    return html;
  }

  async build(): Promise<void> {
    console.time('HTML generation');

    await Promise.all([
      this.ensureDirectoryExists(this.config.outDir),
      ...this.config.templates.map(page => 
        this.ensureDirectoryExists(path.dirname(path.join(this.config.outDir, page.path)))
      )
    ]);

    await Promise.all(
      this.config.templates.map(async (page) => {
        const html = await this.generateHtml(page);
        const outputPath = path.join(this.config.outDir, page.path);
        return fs.writeFile(outputPath, html, 'utf-8');
      })
    );

    console.timeEnd('HTML generation');
  }
}