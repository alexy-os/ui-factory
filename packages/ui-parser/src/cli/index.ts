import { Command } from 'commander';
import { uiParser } from '../core/index.js';
import { configManager } from '../config/index.js';

/**
 * Класс для CLI интерфейса
 */
export class CLI {
  private program: Command;
  
  constructor() {
    this.program = new Command();
    this.setupProgram();
  }
  
  /**
   * Настраивает программу CLI
   */
  private setupProgram() {
    this.program
      .name('ui-parser')
      .description('UI Parser CLI for analyzing and transforming UI components')
      .version('0.0.1');
    
    // Команда analyze
    this.program
      .command('analyze')
      .description('Analyze components and extract classes')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output path for analysis results')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        // Обновляем конфигурацию, если указаны опции
        if (options.source) {
          configManager.updatePaths({ sourceDir: options.source });
        }
        if (options.output) {
          configManager.updatePaths({ domAnalysisResults: options.output });
        }
        
        // Запускаем анализ
        await uiParser.analyze({
          sourceDir: options.source,
          outputPath: options.output,
          verbose: options.verbose
        });
      });
    
    // Команда generate
    this.program
      .command('generate')
      .description('Generate CSS from analysis results')
      .option('-o, --output <path>', 'Output directory for CSS files')
      .option('-f, --format <format>', 'CSS format (css, scss, less)')
      .option('-m, --minify', 'Minify CSS output')
      .action((options) => {
        // Обновляем конфигурацию, если указаны опции
        if (options.output) {
          configManager.updatePaths({ componentOutput: options.output });
        }
        
        // Запускаем генерацию
        uiParser.generate({
          outputPath: options.output,
          format: options.format,
          minify: options.minify
        });
      });
    
    // Команда transform
    this.program
      .command('transform')
      .description('Transform components by replacing classes')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output directory for transformed components')
      .option('-t, --type <type>', 'Transformation type (semantic, quark, both)', 'both')
      .action((options) => {
        // Обновляем конфигурацию, если указаны опции
        if (options.source) {
          configManager.updatePaths({ sourceDir: options.source });
        }
        if (options.output) {
          configManager.updatePaths({ componentOutput: options.output });
        }
        
        // Запускаем трансформацию
        uiParser.transform({
          sourceDir: options.source,
          targetOutputDir: options.output,
          transformationType: options.type
        });
      });
    
    // Команда all
    this.program
      .command('all')
      .description('Run all operations: analyze, generate, transform')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output directory for results')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        // Обновляем конфигурацию, если указаны опции
        if (options.source) {
          configManager.updatePaths({ sourceDir: options.source });
        }
        if (options.output) {
          configManager.updatePaths({ 
            componentOutput: options.output,
            classObject: `${options.output}/classObject.ts`,
            domAnalysisResults: `${options.output}/domAnalysis.json`
          });
        }
        
        // Запускаем все операции
        await uiParser.all({
          sourceDir: options.source,
          outputPath: options.output,
          verbose: options.verbose
        });
      });
  }
  
  /**
   * Запускает CLI
   */
  public run(argv: string[] = process.argv) {
    this.program.parse(argv);
  }
}

// Экспортируем экземпляр для удобного использования
export const cli = new CLI();

export default cli; 