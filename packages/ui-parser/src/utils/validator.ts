import { UIParserConfig, ExtractorType, ConfigJson } from '../config';
import { PathsConfig } from '../config/paths-config';
import { FileFormatConfig } from '../config/file-formats-config';
import { PatternsConfig, PatternConfig } from '../config/patterns-config';

export type { PatternConfig, PatternsConfig, PathsConfig, FileFormatConfig };

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export class ConfigValidator {
  public static validateConfig(config: UIParserConfig): ValidationResult {
    const errors: ValidationError[] = [];
    
    this.validateComponent(errors, config.paths, 'paths', this.validatePaths);
    this.validateComponent(errors, config.classNames, 'classNames', this.validateClassNames);
    this.validateComponent(errors, config.extractor, 'extractor', this.validateExtractor);
    this.validateComponent(errors, config.formats, 'formats', this.validateFormats);
    this.validateComponent(errors, config.patterns, 'patterns', this.validatePatterns);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private static validateComponent<T>(
    errors: ValidationError[],
    component: T,
    path: string,
    validatorFn: (component: T, path: string, errors: ValidationError[]) => void
  ): void {
    if (!component) {
      errors.push({ path, message: `${path} configuration is required` });
      return;
    }
    
    validatorFn.call(this, component, path, errors);
  }
  
  private static validatePaths(paths: PathsConfig, basePath: string, errors: ValidationError[]): void {
    const requiredPaths = ['sourceDir', 'componentOutput', 'domAnalysisResults'];
    
    requiredPaths.forEach(pathKey => {
      const value = paths[pathKey as keyof PathsConfig];
      if (!value) {
        errors.push({ 
          path: `${basePath}.${pathKey}`, 
          message: `${pathKey} is required` 
        });
      } else if (typeof value !== 'string') {
        errors.push({ 
          path: `${basePath}.${pathKey}`, 
          message: `${pathKey} must be a string` 
        });
      }
    });
  }
  
  private static validateClassNames(
    classNames: UIParserConfig['classNames'], 
    basePath: string, 
    errors: ValidationError[]
  ): void {
    if (typeof classNames.semanticPrefix !== 'string') {
      errors.push({ 
        path: `${basePath}.semanticPrefix`, 
        message: 'semanticPrefix must be a string' 
      });
    }
    
    if (typeof classNames.quarkPrefix !== 'string') {
      errors.push({ 
        path: `${basePath}.quarkPrefix`, 
        message: 'quarkPrefix must be a string' 
      });
    }
  }
  
  private static validateExtractor(
    extractor: ExtractorType, 
    basePath: string, 
    errors: ValidationError[]
  ): void {
    if (extractor !== 'dom' && extractor !== 'regex') {
      errors.push({ 
        path: basePath, 
        message: 'Extractor must be either "dom" or "regex"' 
      });
    }
  }
  
  private static validateFormats(
    formats: Record<string, FileFormatConfig>, 
    basePath: string, 
    errors: ValidationError[]
  ): void {
    Object.entries(formats).forEach(([key, format]) => {
      this.validateFileFormat(format, `${basePath}.${key}`, errors);
    });
  }
  
  private static validateFileFormat(
    format: FileFormatConfig, 
    basePath: string, 
    errors: ValidationError[]
  ): void {
    if (!Array.isArray(format.extensions)) {
      errors.push({ 
        path: `${basePath}.extensions`, 
        message: 'Extensions must be an array' 
      });
    } else if (format.extensions.length === 0) {
      errors.push({ 
        path: `${basePath}.extensions`, 
        message: 'Extensions array cannot be empty' 
      });
    } else {
      format.extensions.forEach((ext, index) => {
        if (typeof ext !== 'string' || !ext.startsWith('.')) {
          errors.push({ 
            path: `${basePath}.extensions[${index}]`, 
            message: 'Extension must be a string starting with "."' 
          });
        }
      });
    }
    
    if (!format.patterns) {
      errors.push({ 
        path: `${basePath}.patterns`, 
        message: 'Patterns configuration is required' 
      });
    } else {
      this.validateClassNamePatterns(format.patterns.className, `${basePath}.patterns.className`, errors);
      
      const validContextTypes = ['jsx', 'vue', 'svelte', 'php', 'html', 'const'];
      if (!format.patterns.contextType || !validContextTypes.includes(format.patterns.contextType)) {
        errors.push({ 
          path: `${basePath}.patterns.contextType`, 
          message: `contextType must be one of: ${validContextTypes.join(', ')}` 
        });
      }
    }
  }
  
  private static validateClassNamePatterns(
    patterns: Array<{name: string; pattern: RegExp}> | undefined,
    basePath: string,
    errors: ValidationError[]
  ): void {
    if (!Array.isArray(patterns)) {
      errors.push({ 
        path: basePath, 
        message: 'className patterns must be an array' 
      });
      return;
    }
    
    if (patterns.length === 0) {
      errors.push({ 
        path: basePath, 
        message: 'className patterns array cannot be empty' 
      });
      return;
    }
    
    patterns.forEach((pattern, index) => {
      if (!pattern.name || typeof pattern.name !== 'string') {
        errors.push({ 
          path: `${basePath}[${index}].name`, 
          message: 'Pattern name is required and must be a string' 
        });
      }
      
      if (!pattern.pattern || !(pattern.pattern instanceof RegExp)) {
        errors.push({ 
          path: `${basePath}[${index}].pattern`, 
          message: 'Pattern must be a valid RegExp' 
        });
      }
    });
  }
  
  private static validatePatterns(
    patterns: PatternsConfig, 
    basePath: string, 
    errors: ValidationError[]
  ): void {
    const categories = ['layout', 'sizing', 'typography', 'interaction', 'decoration'];
    
    categories.forEach(category => {
      const patternArray = patterns[category as keyof PatternsConfig];
      this.validatePatternCategory(patternArray, `${basePath}.${category}`, errors);
    });
  }
  
  private static validatePatternCategory(
    patterns: PatternConfig[] | undefined,
    basePath: string,
    errors: ValidationError[]
  ): void {
    if (!Array.isArray(patterns)) {
      errors.push({ 
        path: basePath, 
        message: `Pattern category must be an array` 
      });
      return;
    }
    
    patterns.forEach((pattern, index) => {
      if (!pattern.pattern || typeof pattern.pattern !== 'string') {
        errors.push({ 
          path: `${basePath}[${index}].pattern`, 
          message: 'Pattern must be a string' 
        });
      }
      
      if (pattern.name && typeof pattern.name !== 'string') {
        errors.push({ 
          path: `${basePath}[${index}].name`, 
          message: 'Pattern name must be a string if provided' 
        });
      }
    });
  }
  
  public static validateJsonConfig(jsonConfig: ConfigJson): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (jsonConfig.formats) {
      this.validateJsonFormats(jsonConfig.formats, errors);
    }
    
    if (jsonConfig.patterns) {
      this.validateJsonPatterns(jsonConfig.patterns, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private static validateJsonFormats(
    formats: ConfigJson['formats'], 
    errors: ValidationError[]
  ): void {
    if (!formats) return;
    
    Object.entries(formats).forEach(([key, format]) => {
      if (!Array.isArray(format.extensions)) {
        errors.push({ 
          path: `formats.${key}.extensions`, 
          message: 'Extensions must be an array' 
        });
      }
      
      if (!format.patterns) {
        errors.push({ 
          path: `formats.${key}.patterns`, 
          message: 'Patterns is required' 
        });
      } else {
        this.validateJsonClassNamePatterns(format.patterns.className, `formats.${key}.patterns.className`, errors);
      }
    });
  }
  
  private static validateJsonClassNamePatterns(
    patterns: Array<{name: string; pattern: string}> | undefined,
    basePath: string,
    errors: ValidationError[]
  ): void {
    if (!Array.isArray(patterns)) {
      errors.push({ 
        path: basePath, 
        message: 'className patterns must be an array' 
      });
      return;
    }
    
    patterns.forEach((pattern, index) => {
      if (!pattern.name) {
        errors.push({ 
          path: `${basePath}[${index}].name`, 
          message: 'Pattern name is required' 
        });
      }
      
      if (!pattern.pattern) {
        errors.push({ 
          path: `${basePath}[${index}].pattern`, 
          message: 'Pattern string is required' 
        });
      } else {
        try {
          new RegExp(pattern.pattern);
        } catch (e) {
          errors.push({ 
            path: `${basePath}[${index}].pattern`, 
            message: `Invalid RegExp: ${e instanceof Error ? e.message : String(e)}` 
          });
        }
      }
    });
  }
  
  private static validateJsonPatterns(
    patterns: ConfigJson['patterns'],
    errors: ValidationError[]
  ): void {
    if (!patterns) return;
    
    const categories = ['layout', 'sizing', 'typography', 'interaction', 'decoration'];
    
    categories.forEach(category => {
      const patternArray = patterns[category as keyof typeof patterns];
      
      if (patternArray && !Array.isArray(patternArray)) {
        errors.push({ 
          path: `patterns.${category}`, 
          message: `${category} patterns must be an array` 
        });
      } else if (patternArray) {
        patternArray.forEach((pattern, index) => {
          if (!pattern.pattern) {
            errors.push({ 
              path: `patterns.${category}[${index}].pattern`, 
              message: 'Pattern is required' 
            });
          }
        });
      }
    });
  }
}