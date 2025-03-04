// Экспортируем основные модули
export * from './core/index.js';
export * from './config/index.js';
export * from './adapters/index.js';

// Экспортируем типы
export type {
  EnhancedClassEntry,
  ComponentInfo,
  AnalysisResult,
  CSSGenerationResult,
  TransformationResult,
  AnalysisOptions,
  GenerationOptions,
  TransformationOptions
} from './core/types.js';

// Экспортируем основной класс
import { uiParser } from './core/index.js';
export default uiParser; 