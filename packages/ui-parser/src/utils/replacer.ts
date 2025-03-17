import fs from 'fs';
import path from 'path';
import { configManager } from '../config';
import { EnhancedClassEntry, ModifierEntry } from '../types';

export interface DirectReplacerOptions {
  sourceFile: string;
  quarkOutput: string;
  semanticOutput: string;
  classEntries?: EnhancedClassEntry[];
  transformationType?: 'semantic' | 'quark' | 'both';
}

export class DirectReplacer {
  private classEntries: EnhancedClassEntry[];
  private classMap: Map<string, {
    semantic: string,
    crypto: string,
    modifiers?: ModifierEntry[]
  }>;

  constructor(classEntries: EnhancedClassEntry[]) {
    if (!classEntries || !Array.isArray(classEntries)) {
      throw new Error('DirectReplacer requires valid class entries array');
    }

    this.classEntries = classEntries;
    this.classMap = new Map();

    this.classEntries.forEach(entry => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      try {
        if (Array.isArray(entry.modifiers) && entry.modifiers.length > 0) {
          const modSemanticClasses = entry.modifiers
            .filter(m => m && m.semantic)
            .map(m => m.semantic)
            .join(' ');

          const modCryptoClasses = entry.modifiers
            .filter(m => m && m.crypto)
            .map(m => m.crypto)
            .join(' ');

          if (entry.classes) {
            this.classMap.set(entry.classes, {
              semantic: modSemanticClasses,
              crypto: modCryptoClasses,
              modifiers: entry.modifiers
            });
          }
        } else if (entry.classes && entry.semantic && entry.crypto) {
          this.classMap.set(entry.classes, {
            semantic: entry.semantic,
            crypto: entry.crypto
          });
        }

        if (entry.classes) {
          const normalizedClasses = this.normalizeClassString(entry.classes);
          if (normalizedClasses !== entry.classes) {
            if (Array.isArray(entry.modifiers) && entry.modifiers.length > 0) {
              const modSemanticClasses = entry.modifiers
                .filter(m => m && m.semantic)
                .map(m => m.semantic)
                .join(' ');

              const modCryptoClasses = entry.modifiers
                .filter(m => m && m.crypto)
                .map(m => m.crypto)
                .join(' ');

              this.classMap.set(normalizedClasses, {
                semantic: modSemanticClasses,
                crypto: modCryptoClasses,
                modifiers: entry.modifiers
              });
            } else if (entry.semantic && entry.crypto) {
              this.classMap.set(normalizedClasses, {
                semantic: entry.semantic,
                crypto: entry.crypto
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing class entry:', error);
      }
    });

    if (this.classMap.size === 0) {
      console.warn('DirectReplacer initialized with no valid class entries');
    }
  }

  public async transform(options: DirectReplacerOptions): Promise<void> {
    if (!options || typeof options !== 'object') {
      throw new Error('Invalid options provided to transform method');
    }

    const { sourceFile, quarkOutput, semanticOutput } = options;

    if (!sourceFile || typeof sourceFile !== 'string') {
      throw new Error('sourceFile is required and must be a string');
    }

    if (!quarkOutput || typeof quarkOutput !== 'string') {
      throw new Error('quarkOutput is required and must be a string');
    }

    if (!semanticOutput || typeof semanticOutput !== 'string') {
      throw new Error('semanticOutput is required and must be a string');
    }

    if (!configManager.isValid()) {
      console.warn('Configuration validation failed. Continuing with limited functionality.');
    }

    try {
      if (!fs.existsSync(sourceFile)) {
        throw new Error(`Source file not found: ${sourceFile}`);
      }

      const content = fs.readFileSync(sourceFile, 'utf-8');
      let semanticContent = content;
      let cryptoContent = content;  // Renamed from quarkContent

      const filePatterns = configManager.getPatternsForFile(sourceFile);

      if (!filePatterns) {
        throw new Error(`No patterns found for file type: ${sourceFile}`);
      }

      const foundClasses: Array<{
        fullMatch: string;
        classValue: string;
        index: number;
      }> = [];

      for (const patternObj of filePatterns.patterns) {
        if (!patternObj || !patternObj.pattern || !(patternObj.pattern instanceof RegExp)) {
          continue;
        }

        const regex = patternObj.pattern;
        let match;

        try {
          const patternRegex = new RegExp(regex.source, regex.flags);

          while ((match = patternRegex.exec(content)) !== null) {
            if (match[1]) {
              foundClasses.push({
                fullMatch: match[0],
                classValue: match[1],
                index: match.index
              });
            }
          }
        } catch (error) {
          console.error(`Error applying pattern ${patternObj.name}:`, error);
        }
      }

      if (foundClasses.length === 0) {
        console.warn(`No class declarations found in ${sourceFile}`);
      }

      foundClasses.sort((a, b) => b.index - a.index);

      let replacementCount = 0;

      for (const { fullMatch, classValue, index } of foundClasses) {
        const replacement = this.classMap.get(classValue) ||
          this.classMap.get(this.normalizeClassString(classValue));

        if (replacement) {
          try {
            const attributeType = fullMatch.startsWith('class=') ? 'class' : 'className';

            semanticContent =
              semanticContent.substring(0, index) +
              `${attributeType}="${replacement.semantic}"` +
              semanticContent.substring(index + fullMatch.length);

            cryptoContent =
              cryptoContent.substring(0, index) +
              `${attributeType}="${replacement.crypto}"` +
              cryptoContent.substring(index + fullMatch.length);

            replacementCount++;
          } catch (error) {
            console.error(`Error replacing class "${classValue}":`, error);
          }
        }
      }

      if (replacementCount === 0 && foundClasses.length > 0) {
        console.warn(`Found ${foundClasses.length} classes but made 0 replacements in ${sourceFile}`);
      }

      try {
        fs.mkdirSync(path.dirname(semanticOutput), { recursive: true });
        fs.mkdirSync(path.dirname(quarkOutput), { recursive: true });

        fs.writeFileSync(semanticOutput, semanticContent);
        fs.writeFileSync(quarkOutput, cryptoContent);
      } catch (error) {
        console.error('Error saving transformed files:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error during direct replacement:', error);
      throw error;
    }
  }

  private normalizeClassString(classString: string): string {
    if (!classString || typeof classString !== 'string') {
      return '';
    }
    return classString.split(' ').sort().join(' ');
  }

  public supportsFile(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    return configManager.isFileSupported(filePath);
  }
}