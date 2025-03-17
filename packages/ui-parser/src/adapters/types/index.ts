export type ModifierType = 'layout' | 'sizing' | 'typography' | 'interaction' | 'decoration' | 'source';

export interface ModifierEntry {
  name: string;
  classes: string;
  crypto: string;
  semantic: string;
  type: ModifierType;
} 

export interface Component {
  path: string;
  name: string;
}

export interface ComponentMap {
  [key: string]: Component;
}

export interface EnhancedClassEntry {
  quark: string;
  crypto: string;
  semantic: string;
  classes: string;
  componentName: string;
  elementType: string;
  variants: Record<string, string>;
  isPublic: boolean;
  components: ComponentMap;
  modifiers: ModifierEntry[];
} 

export interface ClassNameConfig {
  quarkPrefix: string;
  semanticPrefix: string;
}

export interface RegexExtractorConfig {
  classNames: ClassNameConfig;
} 

export type PatternContextType = 'jsx' | 'const' | 'config' | 'dynamic' | 'template' | 'php' | 'html' | 'vue' | 'svelte';

export interface PatternConfig {
  pattern: RegExp;
  contextType: PatternContextType;
}

export interface ExtractorPatterns {
  [key: string]: PatternConfig;
} 