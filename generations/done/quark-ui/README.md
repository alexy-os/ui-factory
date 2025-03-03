# Quark UI Generator

A powerful tool for transforming Tailwind utility classes into compact, unique class names, enabling better performance and code protection for your UI components.

## Overview

Quark UI Generator analyzes your React components, extracts Tailwind utility classes, and generates a mapping to short, atomic class names. This approach combines the rapid development benefits of utility-first CSS with the performance advantages of minimal class names and adds a layer of design protection.

## Key Features

- **Automatic Class Analysis**: Scans your components to extract Tailwind utility classes
- **Atomic Name Generation**: Creates compact, unique identifiers based on utility patterns
- **CSS Generation**: Produces optimized CSS with `@apply` directives
- **Design Protection**: Obfuscates your design system implementation details
- **Performance Optimization**: Reduces HTML payload size with shorter class names

## Getting Started

### Installation

No additional installation is required if you're already in the UI Factory project. The tool is integrated into the project's scripts.

### Usage

From the root directory of the project, you can run:

```bash
# Analyze components and update class map
bun run generate:quark-analyze

# Generate quark CSS from class map
bun run generate:quark-css

# Transform HTML to quark HTML
bun run generate:quark-transform

# Run all generation steps at once
bun run generate:quark
```

## Directory Structure

```
generations/quark-ui/
├── cli.ts                # Command-line tool for analysis and generation
├── classMap.json         # Generated mapping of utility classes to quark names
├── quark.css             # Generated CSS with @apply directives
├── components/           # Output directory for transformed components
│   └── HeroSplit.tsx     # Component with quark class names
└── source/               # Directory for components that can be analyzed
    └── HeroSplit.tsx     # Source component with utility classes
```

## How It Works

### 1. Component Analysis

The tool scans components specified in the configuration (in `cli.ts`) and extracts all `className` attributes along with their associated HTML tags:

```typescript
// Configuration in cli.ts
components: [
  {
    path: './generations/quark-ui/source/HeroSplit.tsx',
    name: 'HeroSplit',
  },
  // Add more components here
],
```

For each component, the analyzer:
- Reads the file content
- Finds all `className` attributes using regex
- Determines the HTML tag from the context
- Extracts the utility classes

### 2. Class Normalization

Utility classes are normalized to ensure consistent mapping:

```typescript
// Example of class normalization
"flex gap-4 flex-col" → "flex flex-col gap-4" (sorted alphabetically)
```

The normalization process:
- Merges classes using `tailwind-merge` to remove conflicts
- Sorts classes alphabetically for consistent key generation

### 3. Quark Mapping

A compact key is generated for each unique combination of utility classes:

```typescript
// Example key generation
"flex flex-col gap-4" → "ffcg4"
"w-full py-16 lg:py-32" → "wfp16lp32"
```

This key is then mapped to the original utility classes in `classMap.json`:

```json
{
  "ffcg4": "flex flex-col gap-4",
  "wfp16lp32": "w-full py-16 lg:py-32"
}
```

### 4. CSS Generation

The tool generates CSS using Tailwind's `@apply` directive:

```css
.ffcg4 { @apply flex flex-col gap-4; }
.wfp16lp32 { @apply w-full py-16 lg:py-32; }
```

This CSS is saved to `quark.css` and can be imported into your project.

### 5. Component Transformation

The tool transforms your components to use quark class names:

```jsx
// Before transformation
<div className="flex flex-col gap-4">

// After transformation
<div className="ffcg4">
```

Transformed components are saved to the `components/` directory.

## The Quark Concept

The name "Quark UI" is inspired by quantum physics, where quarks are elementary particles that are the fundamental constituents of matter. Similarly, Quark UI breaks down complex utility class combinations into fundamental, atomic units:

1. **Atomic Nature**: Like quarks in physics, each class name represents a fundamental building block of your UI
2. **Compactness**: Quark class names are extremely compact, reducing HTML payload size
3. **Uniqueness**: Each utility pattern gets a unique identifier, making your design system harder to reverse-engineer
4. **Efficiency**: Shorter class names improve rendering performance and reduce network payload

## Workflow in Detail

### Development Phase

1. Create your components using Tailwind utility classes in the `source/` directory
2. Design and iterate quickly using utility-first approach

### Analysis Phase

1. Run `bun run generate:quark-analyze` to scan components
2. The tool generates `classMap.json` with compact quark keys

### Production Phase

1. Run `bun run generate:quark-css` to generate the CSS
2. Run `bun run generate:quark-transform` to create components with quark classes
3. Use the transformed components and CSS in your production build

### All-in-One Command

Run `bun run generate:quark` to execute all steps at once:
- Analyze components
- Generate CSS
- Transform components

## Benefits of Quark UI

### 1. Performance Optimization

- **Reduced HTML Size**: Shorter class names mean smaller HTML documents
- **Faster Rendering**: Browser needs to process less text in the DOM
- **Improved Network Performance**: Smaller payloads load faster

### 2. Design Protection

- **Obfuscation**: Makes it harder for competitors to copy your exact design implementation
- **Intellectual Property**: Helps protect your design system's unique characteristics
- **Reverse Engineering Prevention**: Obscures the relationship between design and implementation

### 3. Developer Experience

- **Clean Output**: Production code is clean and minimal
- **Maintainable Development**: Continue using readable utility classes during development
- **Automated Process**: No manual work required to optimize class names

## Advanced Usage

### Adding New Components

To add a new component for analysis:

1. Add the component to the `source/` directory
2. Update the `components` array in `cli.ts`:

```typescript
components: [
  {
    path: './generations/quark-ui/source/HeroSplit.tsx',
    name: 'HeroSplit',
  },
  {
    path: './generations/quark-ui/source/NewComponent.tsx',
    name: 'NewComponent',
  },
],
```

3. Run the analysis again

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- Support for additional component types and frameworks
- Integration with build systems for automatic optimization
- Advanced obfuscation techniques for enhanced design protection
- Performance metrics to measure the impact of class name optimization