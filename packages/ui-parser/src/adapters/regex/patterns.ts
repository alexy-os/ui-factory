import { ExtractorPatterns } from './types';

// Patterns for finding classes in different contexts
export const CLASS_PATTERNS: ExtractorPatterns = {
  jsxClassName: {
    pattern: /className=["']([^"']+)["']/g,
    contextType: 'jsx'
  },
  constClassName: {
    pattern: /className:\s*["']([^"']+)["']/g,
    contextType: 'const'
  },
  configClassName: {
    pattern: /\bclassName:\s*["']([^"']+)["']/g,
    contextType: 'config'
  },
  dynamicClassName: {
    pattern: /className=\{(?:clsx|cn)\(\s*(?:['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]+)['"`])*)\s*\)\}/g,
    contextType: 'dynamic'
  },
  templateClassName: {
    pattern: /className=\{`([^`]+)`\}/g,
    contextType: 'template'
  },
  tvVariants: {
    pattern: /tv\(\s*\{([\s\S]*?)\}\s*\)/gs,
    contextType: 'config'
  }
} as const; 