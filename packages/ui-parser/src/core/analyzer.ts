import fs from 'fs';
import path from 'path';
import { adapterFactory } from '../adapters';
import { CONFIG } from '../config';
import { 
  EnhancedClassEntry, 
  ComponentInfo, 
  AnalysisResult, 
  AnalysisOptions 
} from './types';

/**
 * Класс для анализа компонентов
 */
export class ComponentAnalyzer {
  private static instance: ComponentAnalyzer;
  
  private constructor() {}
  
  /**
   * Получение экземпляра ComponentAnalyzer (Singleton)
   */
  public static getInstance(): ComponentAnalyzer {
    if (!ComponentAnalyzer.instance) {
      ComponentAnalyzer.instance = new ComponentAnalyzer();
    }
    return ComponentAnalyzer.instance;
  }
  
  /**
   * Анализирует компонент и извлекает классы
   */
  public async analyzeComponent(componentPath: string): Promise<AnalysisResult> {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    console.log(`Analyzing component: ${componentName}`);
    
    try {
      // Находим подходящий адаптер
      const adapter = adapterFactory.findAdapter(componentPath);
      
      if (!adapter) {
        return {
          entries: [],
          componentName,
          success: false,
          error: `No suitable adapter found for ${componentName}`
        };
      }
      
      console.log(`Using adapter: ${adapter.name}`);
      
      // Извлекаем классы с помощью адаптера
      const entries = await adapter.extractClasses(componentPath);
      
      return {
        entries,
        componentName,
        success: entries.length > 0
      };
    } catch (error) {
      console.error(`Error analyzing component ${componentName}:`, error);
      return {
        entries: [],
        componentName,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Сканирует директорию и находит компоненты
   */
  public scanDirectory(dir: string): ComponentInfo[] {
    const components: ComponentInfo[] = [];
    
    const scan = (currentDir: string, relativeDirPath: string = '') => {
      const files = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(currentDir, file.name);
        const relativeFilePath = path.join(relativeDirPath, file.name);
        
        if (file.isDirectory()) {
          scan(filePath, relativeFilePath);
        } else if (file.isFile() && /\.(tsx|jsx|vue|svelte|html|hbs|handlebars)$/.test(file.name)) {
          const componentName = path.basename(file.name, path.extname(file.name));
          components.push({
            path: filePath,
            name: componentName,
            relativePath: relativeFilePath
          });
        }
      }
    };
    
    scan(dir);
    return components;
  }
  
  /**
   * Анализирует все компоненты в директории
   */
  public async analyzeAllComponents(options: AnalysisOptions = {}): Promise<EnhancedClassEntry[]> {
    const sourceDir = options.sourceDir || CONFIG.paths.sourceDir;
    const outputPath = options.outputPath || CONFIG.paths.domAnalysisResults;
    const verbose = options.verbose || false;
    
    // Получаем список всех компонентов
    const components = this.scanDirectory(sourceDir);
    const results: EnhancedClassEntry[] = [];
    
    console.log(`Found ${components.length} components to analyze`);
    
    for (const component of components) {
      console.log(`Analyzing: ${component.name}`);
      
      try {
        const analysisResult = await this.analyzeComponent(component.path);
        
        if (analysisResult.success) {
          results.push(...analysisResult.entries);
          console.log(`Successfully analyzed ${component.name}, found ${analysisResult.entries.length} class entries`);
        } else {
          console.warn(`No class entries found for ${component.name}${analysisResult.error ? `: ${analysisResult.error}` : ''}`);
        }
      } catch (error) {
        console.error(`Error analyzing ${component.name}:`, error);
      }
    }
    
    // Сохраняем результаты в отдельный файл
    fs.writeFileSync(
      outputPath, 
      JSON.stringify(results, null, 2)
    );
    
    console.log(`Total class entries found: ${results.length}`);
    console.log(`Results saved to: ${outputPath}`);
    
    return results;
  }
  
  /**
   * Загружает результаты анализа из файла
   */
  public loadAnalysisResults(filePath: string = CONFIG.paths.domAnalysisResults): EnhancedClassEntry[] {
    try {
      if (fs.existsSync(filePath)) {
        const jsonContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(jsonContent) as EnhancedClassEntry[];
      }
      return [];
    } catch (error) {
      console.error('Error loading analysis results:', error);
      return [];
    }
  }
}

// Экспортируем экземпляр для удобного использования
export const componentAnalyzer = ComponentAnalyzer.getInstance();

export default componentAnalyzer; 