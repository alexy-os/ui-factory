import { Command } from 'commander';
import { uiParser } from '../core/index.js';
import { configManager, ExtractorType } from '../config/index.js';
import { DirectReplacer } from '../transformers/direct-replacer';
import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from '../core/types';

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
        // Обновляем конфигурацию с правильными путями
        const sourceDir = options.source || configManager.getConfig().paths.sourceDir;
        const outputDir = options.output || configManager.getConfig().paths.componentOutput;
        
        configManager.updatePaths({
          sourceDir,
          componentOutput: outputDir,
          classObject: path.join(outputDir, 'classObject.ts'),
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
    console.log('\n=== Starting component transformation ===');
    const componentName = path.basename(componentPath, path.extname(componentPath));
    const componentDir = path.dirname(componentPath);
    
    console.log(`Component: ${componentName}`);
    console.log(`Directory: ${componentDir}`);

    // Используем путь из конфигурации для файла анализа
    const analysisPath = configManager.getConfig().paths.domAnalysisResults;
    console.log(`Looking for analysis file: ${analysisPath}`);
    
    if (!fs.existsSync(analysisPath)) {
      console.error(`❌ Analysis file not found: ${analysisPath}`);
      return;
    }
    console.log('✓ Analysis file found');

    try {
      // Загружаем результаты анализа
      console.log('Loading class entries from analysis file...');
      const classEntries: EnhancedClassEntry[] = JSON.parse(
        fs.readFileSync(analysisPath, 'utf-8')
      );
      console.log(`✓ Loaded ${classEntries.length} class entries`);

      // Определяем пути для выходных файлов
      const outputDir = configManager.getConfig().paths.componentOutput;
      const quarkOutput = path.join(outputDir, `${componentName}.quark.tsx`);
      const semanticOutput = path.join(outputDir, `${componentName}.semantic.tsx`);
      
      console.log('\nOutput paths:');
      console.log(`Quark: ${quarkOutput}`);
      console.log(`Semantic: ${semanticOutput}`);

      // Создаем директории если их нет
      console.log('\nEnsuring output directories exist...');
      fs.mkdirSync(path.dirname(quarkOutput), { recursive: true });
      fs.mkdirSync(path.dirname(semanticOutput), { recursive: true });
      console.log('✓ Directories created/verified');

      // Создаем и применяем прямую замену классов
      console.log('\nInitializing DirectReplacer...');
      const directReplacer = new DirectReplacer(classEntries);
      
      console.log('Starting transformation...');
      await directReplacer.transform({
        sourceFile: componentPath,
        quarkOutput,
        semanticOutput,
        classEntries
      });

      // Проверяем результаты
      console.log('\nVerifying transformation results...');
      if (fs.existsSync(quarkOutput) && fs.existsSync(semanticOutput)) {
        const quarkSize = fs.statSync(quarkOutput).size;
        const semanticSize = fs.statSync(semanticOutput).size;
        
        console.log(`✓ Quark file created (${quarkSize} bytes)`);
        console.log(`✓ Semantic file created (${semanticSize} bytes)`);
        
        console.log('\n=== Transformation completed successfully ===');
      } else {
        console.error('❌ Output files not found after transformation');
      }

    } catch (error) {
      console.error('\n❌ Error during transformation:');
      console.error(error);
      throw error;
    }
  }
}

// Экспортируем экземпляр для удобного использования
export const cli = new CLI();

export default cli; 