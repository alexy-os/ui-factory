# UI Parser

UI Parser is a tool for analyzing, generating, and transforming UI components. It extracts class names from React components and generates semantic and quark CSS classes.

## Features

- **Component Analysis**: Analyzes React components and extracts class names
- **CSS Generation**: Generates semantic and quark CSS classes
- **Component Transformation**: Transforms components by replacing class names with semantic or quark classes
- **Multiple Adapters**: Supports different methods for extracting classes (DOM, Regex)

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
    classObject: './src/output/classObject.ts',
    domAnalysisResults: './src/output/domAnalysis.json',
  },
  classNames: {
    semanticPrefix: 'semantic-',
    quarkPrefix: 'q-',
  }
});
```

## License

MIT