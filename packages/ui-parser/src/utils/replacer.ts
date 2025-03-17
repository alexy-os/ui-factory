import fs from 'fs';
import path from 'path';
import { configManager } from '../config';
import { EnhancedClassEntry } from '../types';

export interface DirectReplacerOptions {
  sourceFile: string;
  quarkOutput: string;
  semanticOutput: string;
  classEntries?: EnhancedClassEntry[];
  transformationType?: 'semantic' | 'quark' | 'both';
}

export class DirectReplacer {
  private classMap: Map<string, {
    semantic: string;
    crypto: string;
  }>;

  private modifierGroupsMap: Map<string, {
    semantics: string[];
    cryptos: string[];
    originalClasses: string[];
  }>;

  constructor(classEntries: EnhancedClassEntry[]) {
    this.classMap = new Map();
    this.modifierGroupsMap = new Map();

    classEntries.forEach(entry => {
      if (entry.classes) {
        if (entry.modifiers?.length > 0) {
          const modGroup = {
            originalClasses: [
              entry.classes,
              ...entry.modifiers.map(mod => mod.classes).filter(Boolean)
            ],
            semantics: [
              entry.semantic || '',
              ...entry.modifiers.map(mod => mod.semantic).filter(Boolean)
            ],
            cryptos: [
              entry.crypto || '',
              ...entry.modifiers.map(mod => mod.crypto).filter(Boolean)
            ]
          };

          /*console.log(`Processing group for ${entry.componentName}:`, {
            base: entry.classes,
            modifiers: entry.modifiers.map(m => m.classes)
          });*/

          this.modifierGroupsMap.set(entry.classes, modGroup);
        } else {
          if (entry.semantic && entry.crypto) {
            this.classMap.set(entry.classes, {
              semantic: entry.semantic,
              crypto: entry.crypto
            });
          }
        }

        entry.modifiers?.forEach(mod => {
          if (mod.classes && mod.semantic && mod.crypto) {
            this.classMap.set(mod.classes, {
              semantic: mod.semantic,
              crypto: mod.crypto
            });
          }
        });
      }
    });
  }

  public async transform(options: DirectReplacerOptions): Promise<void> {
    const { sourceFile, quarkOutput, semanticOutput } = options;

    try {
      let content = fs.readFileSync(sourceFile, 'utf-8');
      let semanticContent = content;
      let cryptoContent = content;

      for (const [baseClass, group] of this.modifierGroupsMap.entries()) {
        console.error(`Replacing group for base class "${baseClass}":`, group);
        
        for (let i = 0; i < group.originalClasses.length; i++) {
          const originalClass = group.originalClasses[i];
          const semanticClass = group.semantics[i];
          const cryptoClass = group.cryptos[i];

          if (originalClass && (semanticClass || cryptoClass)) {
            const classRegex = new RegExp(this.escapeRegExp(originalClass), 'g');
            
            if (semanticClass) {
              semanticContent = semanticContent.replace(classRegex, semanticClass);
            }
            if (cryptoClass) {
              cryptoContent = cryptoContent.replace(classRegex, cryptoClass);
            }
          }
        }
      }

      const sortedClasses = Array.from(this.classMap.keys())
        .sort((a, b) => b.length - a.length);

      for (const classString of sortedClasses) {
        const replacement = this.classMap.get(classString);
        if (replacement) {
          const classRegex = new RegExp(this.escapeRegExp(classString), 'g');
          semanticContent = semanticContent.replace(classRegex, replacement.semantic);
          cryptoContent = cryptoContent.replace(classRegex, replacement.crypto);
        }
      }

      fs.mkdirSync(path.dirname(semanticOutput), { recursive: true });
      fs.mkdirSync(path.dirname(quarkOutput), { recursive: true });
      
      fs.writeFileSync(semanticOutput, semanticContent);
      fs.writeFileSync(quarkOutput, cryptoContent);

    } catch (error) {
      console.error('Error during direct replacement:', error);
      throw error;
    }
  }

  /*private isClassReplacedInGroups(classString: string): boolean {
    for (const group of this.modifierGroupsMap.values()) {
      if (group.originalClasses.includes(classString)) {
        return true;
      }
    }
    return false;
  }*/

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public supportsFile(filePath: string): boolean {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    return configManager.isFileSupported(filePath);
  }
}