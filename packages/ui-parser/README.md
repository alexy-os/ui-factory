# UI Parser

UI Parser is a tool for analyzing, generating, and transforming UI components. It extracts class names from React components and generates semantic and quark CSS classes.

> ⚠️ **Note**: This project is currently in development and not yet published to npm.

## Features

- **Component Analysis**: Analyzes React components and extracts class names
- **CSS Generation**: Generates semantic and quark CSS classes directly from analysis results
- **Component Transformation**: Transforms components by replacing class names
- **Multiple Adapters**: Supports different methods for extracting classes
- **TV/CVA Support**: Full support for tailwind-variants (tv) and class-variance-authority (cva)
- **Direct Replacement**: Efficient class name replacement using mapping from dataClasses.json
- **Modifier Groups**: Support for handling groups of modifiers and their variants
- **Multiple Output Formats**: Generates both semantic and crypto (quark) versions of components

## Current Usage

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "ui-parser:analyze": "bun ./packages/ui-parser/src/cli/bin.ts analyze",
    "ui-parser:generate": "bun ./packages/ui-parser/src/cli/bin.ts generate",
    "ui-parser:transform": "bun ./packages/ui-parser/src/cli/bin.ts transform",
    "ui:all": "bun ./packages/ui-parser/src/cli/bin.ts all"
  }
}
```

Then run:

```bash
# Analyze components
bun run ui-parser:analyze

# Generate CSS
bun run ui-parser:generate

# Transform components
bun run ui-parser:transform

# Run all operations
bun run ui:all
```

## Configuration

Create a configuration file in your project:

```typescript
import { configManager } from './packages/ui-parser';

configManager.updateConfig({
  paths: {
    sourceDir: './src/components',
    componentOutput: './src/output',
    domAnalysisResults: './src/output/domAnalysis.json',
    dataClasses: './src/data/dataClasses.json'  // Mapping file for class replacements
  },
  classNames: {
    semanticPrefix: 'sc-',    // Prefix for semantic classes
    quarkPrefix: '',         // Prefix for quark classes (crypto)
    outputFormats: ['semantic', 'quark']  // Available output formats
  },
  parser: {
    extractors: ['tv', 'direct'],  // Available extraction methods
    modifierSupport: true,         // Enable modifier groups support
    preserveComments: true         // Preserve component comments during transformation
  }
});
```

## Component Examples

### Button Component with TV

```typescript
// Source component with utility classes
const buttonStyles = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground"
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-base"
    }
  }
});

// Transformed to semantic classes
const buttonStyles = tv({
  base: "sc-layout-center sc-button-base",
  variants: {
    variant: {
      primary: "sc-button-primary",
      secondary: "sc-button-secondary"
    },
    size: {
      sm: "sc-button-sm",
      md: "sc-button-md",
      lg: "sc-button-lg"
    }
  }
});

// Transformed to quark classes
const buttonStyles = tv({
  base: "ivir3",
  variants: {
    variant: {
      primary: "q2idm",
      secondary: "q3kuh"
    },
    size: {
      sm: "h3i4t",
      md: "rcdad",
      lg: "nipd0"
    }
  }
});
```

## Advanced Features

- **Modifier Groups**: Automatically handles related classes as groups
- **Direct Replacement**: Fast and efficient class replacement using pre-defined mappings
- **TV/CVA Integration**: Full support for tailwind-variants and class-variance-authority patterns
- **Multiple Output Formats**: Generate different versions of components simultaneously
- **Preservation**: Maintains component structure and comments during transformation

## Development

This project uses [Bun](https://bun.sh/) as its runtime. Make sure you have Bun installed before running the scripts.

## License

MIT