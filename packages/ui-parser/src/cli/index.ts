import { Command } from 'commander';
import { uiParser } from '../core/index.js';
import { configManager, ExtractorType } from '../config/index.js';
import { DirectReplacer } from '../transformers/direct-replacer';
import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from '../core/types';

interface AllOptions {
  sourceDir?: string;
  outputDir?: string;
  verbose?: boolean;
}

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
    
    // Добавляем команду для установки экстрактора
    this.program
      .command('set-extractor')
      .description('Set the class extractor type (dom|regex)')
      .argument('<type>', 'Extractor type: dom or regex')
      .action((type: string) => {
        if (type === 'dom' || type === 'regex') {
          configManager.setExtractor(type as ExtractorType);
          console.log(`Extractor set to: ${type}`);
        } else {
          console.error('Invalid extractor type. Use "dom" or "regex"');
        }
      });
    
    // Команда analyze
    this.program
      .command('analyze')
      .description('Analyze components and extract classes')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output path for analysis results')
      .option('-e, --extractor <type>', 'Extractor type (dom|regex)', 'regex')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        if (options.extractor) {
          configManager.setExtractor(options.extractor as ExtractorType);
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
    
    // Команда generate
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
    
    // Команда transform
    this.program
      .command('transform')
      .description('Transform components by replacing classes')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output directory for transformed components')
      .option('-t, --type <type>', 'Transformation type (semantic, quark, both)', 'both')
      .action(async (options) => {
        // Обновляем конфигурацию, если указаны опции
        if (options.source) {
          configManager.updatePaths({ sourceDir: options.source });
        }
        if (options.output) {
          configManager.updatePaths({ componentOutput: options.output });
        }

        const sourceDir = options.source || configManager.getConfig().paths.sourceDir;
        
        try {
          // Получаем список компонентов для трансформации
          const files = fs.readdirSync(sourceDir)
            .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
          
          console.log(`Found ${files.length} components to transform`);
          
          // Трансформируем каждый компонент
          for (const file of files) {
            const componentPath = path.join(sourceDir, file);
            await this.transformComponent(componentPath);
          }
          
          console.log('\nAll components transformed successfully!');
        } catch (error) {
          console.error('Error during transformation:', error);
        }
      });
    
    // Команда all
    this.program
      .command('all')
      .description('Run all operations: analyze, generate, transform')
      .option('-s, --source <path>', 'Source directory with components')
      .option('-o, --output <path>', 'Output directory for results')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        const sourceDir = options.source || configManager.getConfig().paths.sourceDir;
        const outputDir = options.output || configManager.getConfig().paths.componentOutput;
        
        configManager.updatePaths({
          sourceDir,
          componentOutput: outputDir,
          domAnalysisResults: path.join(outputDir, 'domAnalysis.json')
        });

        try {
          // Шаг 1: Анализ
          console.log('Step 1: Analyzing components...');
          await uiParser.analyze({
            sourceDir,
            outputPath: outputDir,
            verbose: options.verbose
          });

          // Шаг 2: Генерация CSS
          console.log('\nStep 2: Generating CSS...');
          await uiParser.generate({
            outputPath: outputDir
          });

          // Шаг 3: Трансформация компонентов
          console.log('\nStep 3: Transforming components...');
          const files = fs.readdirSync(sourceDir)
            .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));

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
   * Запускает CLI
   */
  public run(argv: string[] = process.argv) {
    this.program.parse(argv);
  }

  private async transformComponent(componentPath: string): Promise<void> {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    
    try {
      const analysisPath = configManager.getConfig().paths.domAnalysisResults;
      
      if (!fs.existsSync(analysisPath)) {
        throw new Error(`Analysis file not found: ${analysisPath}`);
      }

      const classEntries: EnhancedClassEntry[] = JSON.parse(
        fs.readFileSync(analysisPath, 'utf-8')
      );

      const outputDir = configManager.getConfig().paths.componentOutput;
      const quarkOutput = path.join(outputDir, `${componentName}.quark.tsx`);
      const semanticOutput = path.join(outputDir, `${componentName}.semantic.tsx`);

      const directReplacer = new DirectReplacer(classEntries);
      await directReplacer.transform({
        sourceFile: componentPath,
        quarkOutput,
        semanticOutput,
        classEntries
      });

    } catch (error) {
      console.error(`❌ Failed to transform ${componentName}:`, 
        error instanceof Error ? error.message : error);
      throw error;
    }
  }

  public async all(options: AllOptions = {}) {
    try {
      console.log('🚀 Starting UI Parser...');

      // Анализ
      console.log('\n📊 Analyzing components...');
      await uiParser.analyze(options);

      // Генерация CSS
      console.log('\n🎨 Generating CSS...');
      await uiParser.generate(options);

      // Трансформация
      console.log('\n🔄 Transforming components...');
      const files = fs.readdirSync(options.sourceDir || configManager.getConfig().paths.sourceDir)
        .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));

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

// Экспортируем экземпляр для удобного использования
export const cli = new CLI();

export default cli; 