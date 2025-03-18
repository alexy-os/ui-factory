import { Command } from 'commander';
import { uiParser } from '../utils/parser';
import { configManager } from '../config';
import { DirectReplacer } from '../utils/replacer';
import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from '../types';

interface AllOptions {
  sourceDir?: string;
  outputDir?: string;
  verbose?: boolean;
}

/**
 * CLI class for the UI Parser
 */
export class CLI {
  private program: Command;
  private fileExtensionsPattern: RegExp;
  
  constructor() {
    this.program = new Command();
    this.fileExtensionsPattern = this.buildFileExtensionsPattern();
    this.setupProgram();
  }
  
  /**
   * Builds a RegExp pattern for supported file extensions from config
   */
  private buildFileExtensionsPattern(): RegExp {
    const config = configManager.getConfig();
    const allExtensions: string[] = [];

    const defaultExtensions = ['tsx', 'jsx', 'js', 'vue', 'svelte', 'html', 'hbs', 'handlebars', 'php'];
    
    Object.values(config.formats || {}).forEach(format => {
      if (format.extensions && Array.isArray(format.extensions)) {
        const extensions = format.extensions.map(ext => 
          ext.startsWith('.') ? ext.substring(1) : ext
        );
        allExtensions.push(...extensions);
      }
    });
    
    if (allExtensions.length === 0) {
      allExtensions.push(...defaultExtensions);
    }
    
    const uniqueExtensions = [...new Set(allExtensions)];
    
    return new RegExp(`\\.(${uniqueExtensions.join('|')})$`, 'i');
  }
  
  /**
   * Checks if a file is a component file based on its extension
   */
  private isComponentFile(filename: string): boolean {
    return this.fileExtensionsPattern.test(filename);
  }
  
  /**
   * Configures the CLI program
   */
  private setupProgram() {
    this.program
      .name('ui-parser')
      .description('UI Parser CLI for analyzing and transforming UI components')
      .version('0.0.1');
    
    /*this.program
      .command('set-extractor <type>')
      .description('Set the class extractor type (dom|regex)')
      .action((type: string) => {
        if (type === 'dom' || type === 'regex') {
          configManager.setExtractor(type);
          console.log(`Extractor set to: ${type}`);
        } else {
          console.error('Invalid extractor type. Use "dom" or "regex"');
        }
      });*/
    
    this.program
      .command('analyze')
      .description('Analyze components and extract classes')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output path for analysis results')
      .option('-e, --extractor <type>', 'Extractor type (dom|regex)', 'regex')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        if (options.extractor) {
          configManager.setExtractor(options.extractor);
        }
        if (options.source) {
          configManager.updatePaths({ sourceDir: options.source });
        }
        if (options.output) {
          configManager.updatePaths({ domAnalysisResults: options.output });
        }
        
        await uiParser.analyze({
          sourceDir: options.source,
          outputPath: options.output,
          verbose: options.verbose
        });
      });
    
    this.program
      .command('generate')
      .description('Generate CSS from analysis results')
      .option('-o, --output <path>', 'Output directory for CSS files')
      .option('-f, --format <format>', 'CSS format (css, scss, less)')
      .option('-m, --minify', 'Minify CSS output')
      .action((options) => {
        if (options.output) {
          configManager.updatePaths({ componentOutput: options.output });
        }
        
        uiParser.generate({
          outputPath: options.output,
          format: options.format,
          minify: options.minify
        });
      });
      
    this.program
      .command('transform')
      .description('Transform components by replacing classes')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output directory for transformed components')
      .option('-t, --type <type>', 'Transformation type (semantic, quark, both)', 'both')
      .action(async (options) => {
        if (options.source) {
          configManager.updatePaths({ sourceDir: options.source });
        }
        if (options.output) {
          configManager.updatePaths({ componentOutput: options.output });
        }

        const sourceDir = options.source || configManager.getConfig().paths.sourceDir;
        
        try {
          const files = fs.readdirSync(sourceDir)
            .filter(file => this.isComponentFile(file));
          
          console.log(`Found ${files.length} components to transform`);
          
          for (const file of files) {
            const componentPath = path.join(sourceDir, file);
            await this.transformComponent(componentPath);
          }
          
          console.log('\nAll components transformed successfully!');
        } catch (error) {
          console.error('Error during transformation:', error);
        }
      });
    
    this.program
      .command('all')
      .description('Run all operations: analyze, generate, transform')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output directory for results')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        const sourceDir = options.source || configManager.getConfig().paths.sourceDir;
        const outputDir = options.output || configManager.getConfig().paths.componentOutput;

        const domAnalysisResults = configManager.getPath('domAnalysisResults') || path.join(outputDir, 'domAnalysis.json');
        
        configManager.updatePaths({
          sourceDir,
          componentOutput: outputDir,
          domAnalysisResults: domAnalysisResults
        });

        try {
          console.log('Step 1: Analyzing components...');
          await uiParser.analyze({
            sourceDir,
            outputPath: outputDir,
            verbose: options.verbose
          });

          console.log('\nStep 2: Generating CSS...');
          await uiParser.generate({
            outputPath: outputDir
          });

          console.log('\nStep 3: Transforming components...');
          const files = fs.readdirSync(sourceDir)
            .filter(file => this.isComponentFile(file));

          for (const file of files) {
            const componentPath = path.join(sourceDir, file);
            await this.transformComponent(componentPath);
          }

          console.log('\nAll operations completed successfully!');
        } catch (error) {
          console.error('Error during operations:', error);
          throw error;
        }
      });
  }
  
  /**
   * Runs the CLI
   */
  public run(argv: string[] = process.argv) {
    this.program.parse(argv);
  }

  private async transformComponent(componentPath: string): Promise<void> {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    const extension = path.extname(componentPath);
    
    try {
      const analysisPath = configManager.getConfig().paths.domAnalysisResults;
      
      if (!fs.existsSync(analysisPath)) {
        throw new Error(`Analysis file not found: ${analysisPath}`);
      }

      const classEntries: EnhancedClassEntry[] = JSON.parse(
        fs.readFileSync(analysisPath, 'utf-8')
      );

      const outputDir = configManager.getConfig().paths.componentOutput;
      
      // Получаем относительный путь компонента от sourceDir
      const sourceDir = configManager.getConfig().paths.sourceDir;
      const relativePath = path.relative(sourceDir, componentPath);
      
      // Формируем пути с сохранением структуры папок и оригинальных имен файлов
      const quarkOutput = path.join(outputDir, 'quark', relativePath);
      const semanticOutput = path.join(outputDir, 'semantic', relativePath);

      const directReplacer = new DirectReplacer(classEntries);
      await directReplacer.transform({
        sourceFile: componentPath,
        quarkOutput,
        semanticOutput,
        classEntries
      });
      
      // Обновляем экспорты в сгенерированных файлах, если они существуют
      this.updateExports(quarkOutput, 'Quark');
      this.updateExports(semanticOutput, 'Semantic');

    } catch (error) {
      console.error(`❌ Failed to transform ${componentName}:`, 
        error instanceof Error ? error.message : error);
      throw error;
    }
  }
  
  /**
   * Обновляет экспорты в сгенерированных файлах
   */
  private updateExports(filePath: string, suffix: string): void {
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Регулярное выражение для поиска экспортов вида: export const ComponentNameSuffix = ComponentName;
      const exportRegex = new RegExp(`export const (\\w+)${suffix} = (\\w+);`, 'g');
      
      // Заменяем на экспорт без суффикса: export const ComponentName = ComponentName;
      content = content.replace(exportRegex, 'export const $1 = $2;');
      
      fs.writeFileSync(filePath, content);
    } catch (error) {
      console.error(`Error updating exports in ${filePath}:`, error);
    }
  }

  public async all(options: AllOptions = {}) {
    try {
      console.log('🚀 Starting UI Parser...');

      console.log('\n📊 Analyzing components...');
      await uiParser.analyze(options);

      console.log('\n🎨 Generating CSS...');
      await uiParser.generate(options);

      console.log('\n🔄 Transforming components...');
      const files = fs.readdirSync(options.sourceDir || configManager.getConfig().paths.sourceDir)
        .filter(file => this.isComponentFile(file));

      for (const file of files) {
        await this.transformComponent(path.join(options.sourceDir || configManager.getConfig().paths.sourceDir, file));
      }

      console.log('\n✨ All operations completed successfully!');
    } catch (error) {
      console.error('\n❌ Process failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}

export const cli = new CLI();

export default cli; 