import fs from 'fs';
import path from 'path';
import { adapterFactory } from '../adapters';
import { configManager } from '../config';
import {
  EnhancedClassEntry,
  ComponentInfo,
  AnalysisResult,
  AnalysisOptions
} from '../types';

export class ComponentAnalyzer {
  private static instance: ComponentAnalyzer;
  private cachedAnalysisResults: Map<string, EnhancedClassEntry[]> = new Map();
  private cachedComponents: Map<string, ComponentInfo[]> = new Map();

  private constructor() { }

  public static getInstance(): ComponentAnalyzer {
    if (!ComponentAnalyzer.instance) {
      ComponentAnalyzer.instance = new ComponentAnalyzer();
    }
    return ComponentAnalyzer.instance;
  }

  public async analyzeComponent(componentPath: string): Promise<AnalysisResult> {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    console.log(`Analyzing component: ${componentName}`);

    try {
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

  public scanDirectory(dir: string): ComponentInfo[] {
    if (this.cachedComponents.has(dir)) {
      console.log(`Using cached component scan results for: ${dir}`);
      return this.cachedComponents.get(dir) || [];
    }

    const components: ComponentInfo[] = [];

    const scan = (currentDir: string, relativeDirPath: string = '') => {
      const files = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(currentDir, file.name);
        const relativeFilePath = path.join(relativeDirPath, file.name);

        if (file.isDirectory()) {
          scan(filePath, relativeFilePath);
        } else if (file.isFile() && configManager.isFileSupported(file.name)) {
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

    this.cachedComponents.set(dir, components);

    return components;
  }

  public clearComponentCache(dir?: string): void {
    if (dir) {
      this.cachedComponents.delete(dir);
    } else {
      this.cachedComponents.clear();
    }
  }

  public async analyzeAllComponents(options: AnalysisOptions = {}): Promise<EnhancedClassEntry[]> {
    const sourceDir = options.sourceDir || configManager.getPath('sourceDir');
    const outputPath = options.outputPath || configManager.getPath('domAnalysisResults');

    if (options.verbose) {
      this.clearComponentCache(sourceDir);
    }

    const components = this.scanDirectory(sourceDir);
    const results: EnhancedClassEntry[] = [];

    console.log(`Found ${components.length} components to analyze`);

    for (const component of components) {
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

    try {

      const domAnalysisResults = configManager.getPath('domAnalysisResults');

      const outputFilePath = domAnalysisResults.endsWith('.json')
        ? domAnalysisResults
        : path.join(outputPath, 'domAnalysis.json');

      const outputDir = path.dirname(outputFilePath);
      fs.mkdirSync(outputDir, { recursive: true });

      fs.writeFileSync(
        outputFilePath,
        JSON.stringify(results, null, 2),
        'utf-8'
      );


      console.log(`Results saved to: ${outputFilePath}`);

      configManager.setPath('domAnalysisResults', outputFilePath);

      this.cachedAnalysisResults.set(outputFilePath, results);

    } catch (error) {
      console.error('Error saving analysis results:', error);
      throw error;
    }

    return results;
  }

  public loadAnalysisResults(filePath: string = configManager.getPath('domAnalysisResults')): EnhancedClassEntry[] {
    if (this.cachedAnalysisResults.has(filePath)) {
      console.log(`Using cached analysis results for: ${filePath}`);
      return this.cachedAnalysisResults.get(filePath) || [];
    }

    try {
      if (fs.existsSync(filePath)) {
        const jsonContent = fs.readFileSync(filePath, 'utf-8');
        const results = JSON.parse(jsonContent) as EnhancedClassEntry[];

        this.cachedAnalysisResults.set(filePath, results);

        return results;
      }
      return [];
    } catch (error) {
      console.error('Error loading analysis results:', error);
      return [];
    }
  }

  public clearAnalysisCache(filePath?: string): void {
    if (filePath) {
      this.cachedAnalysisResults.delete(filePath);
    } else {
      this.cachedAnalysisResults.clear();
    }
  }
}

export const componentAnalyzer = ComponentAnalyzer.getInstance();

export default componentAnalyzer; 