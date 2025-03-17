# UI Parser

UI Parser is a tool for analyzing, generating, and transforming UI components. It extracts class names from React components and generates semantic and quark CSS classes.

## Features

- **Component Analysis**: Analyzes React components and extracts class names
- **CSS Generation**: Generates semantic and quark CSS classes directly from analysis results
- **Component Transformation**: Transforms components by replacing class names
- **Multiple Adapters**: Supports different methods for extracting classes
- **TV/CVA Support**: Full support for tailwind-variants (tv) and class-variance-authority (cva)
- **Direct Replacement**: Efficient class name replacement using mapping from dataClasses.json
- **Modifier Groups**: Support for handling groups of modifiers and their variants
- **Multiple Output Formats**: Generates both semantic and crypto (quark) versions of components

## Installation

```bash
npm install @ui-factory/ui-parser
```

## Usage

### CLI

```bash
# Analyze components
ui-parser analyze --source ./src/components

# Generate CSS
ui-parser generate

# Transform components
ui-parser transform

# Run all operations
ui-parser all
```

### API

```typescript
import { uiParser } from '@ui-factory/ui-parser';

// Analyze components
await uiParser.analyze({ sourceDir: './src/components' });

// Generate CSS
uiParser.generate();

// Transform components
uiParser.transform();

// Run all operations
await uiParser.all();
```

## Configuration

You can configure UI Parser by updating the configuration:

```typescript
import { configManager } from '@ui-factory/ui-parser';

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

### Input Component

```typescript
// Source component with utility classes
const buttonStyles = tv({
  base: "inline-flex items-center justify-center gap-2",
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground"
    }
  }
});

// Transformed to semantic classes
const buttonStyles = tv({
  base: "sc-layout-center",
  variants: {
    variant: {
      primary: "sc-button-primary",
      secondary: "sc-button-secondary"
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

## License

MIT