import fs from 'fs';
import path from 'path';
import { EnhancedClassEntry } from '../core/types';

interface DirectReplacerOptions {
  sourceFile: string;
  quarkOutput: string;
  semanticOutput: string;
  classEntries: EnhancedClassEntry[];
}

interface ReplacementResult {
  result: string;
  replacementCount: number;
}

export class DirectReplacer {
  private classMap: Map<string, { quark: string; semantic: string }>;

  constructor(classEntries: EnhancedClassEntry[]) {
    const sortedEntries = classEntries
      .map(entry => ({
        original: entry.classes,
        quark: entry.quark,
        semantic: entry.semantic
      }))
      .sort((a, b) => b.original.length - a.original.length);

    this.classMap = new Map(
      sortedEntries.map(entry => [
        entry.original,
        { quark: entry.quark, semantic: entry.semantic }
      ])
    );
  }

  /**
   * Updates import statements in the content
   */
  private updateImports(content: string, variant: 'quark' | 'semantic'): string {
    let result = content;

    // Update component imports
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    result = result.replace(importRegex, (match, imports, importPath) => {
      // Skip external imports (starting with @ or not starting with ./)
      if (importPath.startsWith('@') || !importPath.startsWith('.')) {
        return match;
      }

      // Add the variant extension to the import path
      const updatedPath = importPath.endsWith(`.${variant}`)
        ? importPath
        : `${importPath}.${variant}`;

      return `import {${imports}} from "${updatedPath}"`;
    });

    // Update type imports
    const typeImportRegex = /import\s+type\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    result = result.replace(typeImportRegex, (match, imports, importPath) => {
      if (importPath.startsWith('@') || !importPath.startsWith('.')) {
        return match;
      }

      const updatedPath = importPath.endsWith(`.${variant}`)
        ? importPath
        : `${importPath}.${variant}`;

      return `import type {${imports}} from "${updatedPath}"`;
    });

    return result;
  }

  private replaceClassesInContent(content: string, useQuark: boolean): ReplacementResult {
    let result = content;
    let replacementCount = 0;

    for (const [originalClasses, { quark, semantic }] of this.classMap) {
      const replacement = useQuark ? quark : semantic;
      const escapedClasses = originalClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(`(['"\`])${escapedClasses}\\1`, 'g');
      
      result = result.replace(searchRegex, (_, quote) => {
        replacementCount++;
        return `${quote}${replacement}${quote}`;
      });
    }

    return { result, replacementCount };
  }

  public async transform(options: DirectReplacerOptions): Promise<void> {
    const { sourceFile, quarkOutput, semanticOutput } = options;

    try {
      if (!fs.existsSync(sourceFile)) {
        throw new Error(`Source file not found: ${sourceFile}`);
      }

      // Read the source file
      const content = fs.readFileSync(sourceFile, 'utf-8');
      const componentName = path.basename(sourceFile, path.extname(sourceFile));

      // Create versions with different classes
      const quarkContent = this.replaceClassesInContent(content, true);
      const semanticContent = this.replaceClassesInContent(content, false);

      // Update imports for each version
      const quarkWithImports = this.updateImports(quarkContent.result, 'quark');
      const semanticWithImports = this.updateImports(semanticContent.result, 'semantic');

      // Wrap the content in the correct export
      const wrappedQuarkContent = this.wrapWithExport(quarkWithImports, componentName, 'Quark');
      const wrappedSemanticContent = this.wrapWithExport(semanticWithImports, componentName, 'Semantic');

      // Create the output directories
      const outputDir = path.dirname(quarkOutput);
      fs.mkdirSync(outputDir, { recursive: true });

      // Save the files
      fs.writeFileSync(quarkOutput, wrappedQuarkContent);
      fs.writeFileSync(semanticOutput, wrappedSemanticContent);

      console.log(`✓ Component ${componentName} transformed successfully`);
    } catch (error) {
      console.error('Error during transformation:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Wraps component content with proper export
   */
  private wrapWithExport(content: string, componentName: string, variant: 'Quark' | 'Semantic'): string {
    // Find the original export
    const exportMatch = content.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
    
    if (!exportMatch) {
      // If no explicit export is found, leave as is
      return content;
    }

    // Replace the original export with a named export
    const modifiedContent = content.replace(
      /export\s+(?:default\s+)?(?=(?:function|const|class)\s+\w+)/,
      ''
    );

    // Add the new export to the end of the file
    return `${modifiedContent}

// Export with variant name
export { ${componentName} as ${componentName}${variant} };
export default ${componentName};
`;
  }
}