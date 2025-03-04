/**
 * Расширенная запись о классе с дополнительной информацией
 */
export interface EnhancedClassEntry {
  quark: string;
  semantic: string;
  classes: string;
  componentName: string;     // Название компонента
  elementType: string;       // HTML тег
  variants: {                // Варианты компонента (если есть)
    [key: string]: string | undefined;
  };
  isPublic: boolean;         // Видимый элемент или вспомогательный
  components: Record<string, {
    path: string;
    name: string;
  }>;
}

/**
 * Информация о компоненте
 */
export interface ComponentInfo {
  path: string;
  name: string;
  relativePath: string;
}

/**
 * Результат анализа компонента
 */
export interface AnalysisResult {
  entries: EnhancedClassEntry[];
  componentName: string;
  success: boolean;
  error?: string;
}

/**
 * Результат генерации CSS
 */
export interface CSSGenerationResult {
  quarkCSS: string;
  semanticCSS: string;
}

/**
 * Результат трансформации компонентов
 */
export interface TransformationResult {
  componentsTransformed: number;
  classesReplaced: number;
  errors: Array<{
    component: string;
    error: string;
  }>;
}

/**
 * Опции для анализа компонентов
 */
export interface AnalysisOptions {
  sourceDir?: string;
  outputPath?: string;
  verbose?: boolean;
}

/**
 * Опции для генерации CSS
 */
export interface GenerationOptions {
  outputPath?: string;
  format?: 'css' | 'scss' | 'less';
  minify?: boolean;
}

/**
 * Опции для трансформации компонентов
 */
export interface TransformationOptions {
  sourceDir?: string;
  targetOutputDir?: string;
  transformationType?: 'semantic' | 'quark' | 'both';
} 