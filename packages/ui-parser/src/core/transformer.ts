import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';
import { componentAnalyzer } from './analyzer';
import { EnhancedClassEntry, TransformationOptions, TransformationResult } from './types';

/**
 * Класс для трансформации компонентов
 */
export class ComponentTransformer {
  private static instance: ComponentTransformer;
  
  private constructor() {}
  
  /**
   * Получение экземпляра ComponentTransformer (Singleton)
   */
  public static getInstance(): ComponentTransformer {
    if (!ComponentTransformer.instance) {
      ComponentTransformer.instance = new ComponentTransformer();
    }
    return ComponentTransformer.instance;
  }
  
  /**
   * Трансформирует компоненты, заменяя классы на семантические или кварк
   */
  public transformComponents(options: TransformationOptions = {}): TransformationResult {
    const sourceDir = options.sourceDir || CONFIG.paths.sourceDir;
    const targetOutputDir = options.targetOutputDir || CONFIG.paths.componentOutput;
    const transformationType = options.transformationType || 'both';
    
    // Получаем список компонентов
    const components = componentAnalyzer.scanDirectory(sourceDir);
    
    // Загружаем данные напрямую из JSON для более точного сопоставления
    let domAnalysisData: EnhancedClassEntry[] = [];
    try {
      const jsonContent = fs.readFileSync(CONFIG.paths.domAnalysisResults, 'utf-8');
      domAnalysisData = JSON.parse(jsonContent);
      console.log(`Loaded ${domAnalysisData.length} class entries from domAnalysis.json`);
    } catch (error) {
      console.error('Error loading domAnalysis.json:', error);
      return {
        componentsTransformed: 0,
        classesReplaced: 0,
        errors: [{
          component: 'domAnalysis.json',
          error: error instanceof Error ? error.message : String(error)
        }]
      };
    }
    
    // Создаем карту классов для быстрого поиска
    const classMap = new Map<string, { semantic: string, quark: string }>();
    
    domAnalysisData.forEach(entry => {
      // Используем оригинальную строку классов как ключ
      classMap.set(entry.classes, {
        semantic: entry.semantic,
        quark: entry.quark
      });
      
      // Также добавляем нормализованную версию для надежности
      const normalizedClasses = this.normalizeClassString(entry.classes);
      if (normalizedClasses !== entry.classes) {
        classMap.set(normalizedClasses, {
          semantic: entry.semantic,
          quark: entry.quark
        });
      }
    });
    
    console.log(`Created class map with ${classMap.size} entries`);
    
    // Результаты трансформации
    const result: TransformationResult = {
      componentsTransformed: 0,
      classesReplaced: 0,
      errors: []
    };
    
    for (const component of components) {
      console.log(`Processing component: ${component.name}`);
      
      try {
        // Читаем содержимое компонента
        const content = fs.readFileSync(component.path, 'utf-8');
        
        // Создаем версии с семантическими и кварк классами
        let semanticContent = content;
        let quarkContent = content;
        
        // Находим все классы с помощью регулярного выражения
        const classRegex = /className=["']([^"']+)["']/g;
        let match;
        
        // Массив для хранения всех найденных классов
        const foundClasses: Array<{
          fullMatch: string;
          classValue: string;
          index: number;
        }> = [];
        
        // Находим все вхождения className
        while ((match = classRegex.exec(content)) !== null) {
          foundClasses.push({
            fullMatch: match[0],
            classValue: match[1],
            index: match.index
          });
        }
        
        console.log(`Found ${foundClasses.length} className declarations in ${component.name}`);
        
        // Обрабатываем найденные классы в обратном порядке (чтобы индексы не сбивались)
        for (let i = foundClasses.length - 1; i >= 0; i--) {
          const { fullMatch, classValue, index } = foundClasses[i];
          
          // Проверяем прямое совпадение
          if (classMap.has(classValue)) {
            const replacement = classMap.get(classValue)!;
            
            // Заменяем в семантической версии
            if (transformationType === 'semantic' || transformationType === 'both') {
              semanticContent = 
                semanticContent.substring(0, index) + 
                `className="${replacement.semantic}"` + 
                semanticContent.substring(index + fullMatch.length);
            }
            
            // Заменяем в кварк версии
            if (transformationType === 'quark' || transformationType === 'both') {
              quarkContent = 
                quarkContent.substring(0, index) + 
                `className="${replacement.quark}"` + 
                quarkContent.substring(index + fullMatch.length);
            }
            
            result.classesReplaced++;
            console.log(`Replaced "${classValue}" with semantic: "${replacement.semantic}" and quark: "${replacement.quark}"`);
            continue;
          }
          
          // Проверяем нормализованную версию
          const normalizedClassValue = this.normalizeClassString(classValue);
          if (classMap.has(normalizedClassValue)) {
            const replacement = classMap.get(normalizedClassValue)!;
            
            // Заменяем в семантической версии
            if (transformationType === 'semantic' || transformationType === 'both') {
              semanticContent = 
                semanticContent.substring(0, index) + 
                `className="${replacement.semantic}"` + 
                semanticContent.substring(index + fullMatch.length);
            }
            
            // Заменяем в кварк версии
            if (transformationType === 'quark' || transformationType === 'both') {
              quarkContent = 
                quarkContent.substring(0, index) + 
                `className="${replacement.quark}"` + 
                quarkContent.substring(index + fullMatch.length);
            }
            
            result.classesReplaced++;
            console.log(`Replaced normalized "${normalizedClassValue}" with semantic: "${replacement.semantic}" and quark: "${replacement.quark}"`);
            continue;
          }
          
          console.log(`No replacement found for "${classValue}"`);
        }
        
        // Создаем выходные директории
        const outputPath = path.join(targetOutputDir, component.relativePath);
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Получаем базовое имя файла и расширение
        const baseName = path.basename(outputPath, path.extname(outputPath));
        const extension = path.extname(outputPath);
        
        // Сохраняем трансформированные компоненты
        if (transformationType === 'semantic' || transformationType === 'both') {
          const semanticOutputPath = path.join(outputDir, `${baseName}.semantic${extension}`);
          fs.writeFileSync(semanticOutputPath, semanticContent);
        }
        
        if (transformationType === 'quark' || transformationType === 'both') {
          const quarkOutputPath = path.join(outputDir, `${baseName}.quark${extension}`);
          fs.writeFileSync(quarkOutputPath, quarkContent);
        }
        
        result.componentsTransformed++;
        console.log(`Transformed component ${component.name} saved`);
      } catch (error) {
        console.error(`Error transforming component ${component.name}:`, error);
        result.errors.push({
          component: component.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return result;
  }
  
  /**
   * Нормализует строку классов
   */
  private normalizeClassString(classString: string): string {
    return classString.split(' ').sort().join(' ');
  }
}

// Экспортируем экземпляр для удобного использования
export const componentTransformer = ComponentTransformer.getInstance();

export default componentTransformer; 