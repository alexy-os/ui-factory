export type PatternContextType = 'jsx' | 'const' | 'config' | 'dynamic' | 'template';

export interface PatternConfig {
  pattern: RegExp;
  contextType: PatternContextType;
}

export interface ExtractorPatterns {
  [key: string]: PatternConfig;
} 