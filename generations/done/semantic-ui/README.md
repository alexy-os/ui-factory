# Semantic UI Generator

A powerful tool for transforming Tailwind utility classes into semantic class names, enabling better maintainability and readability of your UI components.

## Overview

Semantic UI Generator analyzes your React components, extracts Tailwind utility classes, and generates a mapping to semantic class names. This approach combines the rapid development benefits of utility-first CSS with the maintainability advantages of semantic class names.

## Key Features

- **Automatic Class Analysis**: Scans your components to extract Tailwind utility classes
- **Semantic Name Generation**: Creates meaningful class names based on HTML tags and utility patterns
- **CSS Generation**: Produces optimized CSS with `@apply` directives
- **Customizable Mapping**: Allows manual refinement of semantic names

## Getting Started

### Installation

No additional installation is required if you're already in the UI Factory project. The tool is integrated into the project's scripts.

### Usage

From the root directory of the project, you can run:

```bash
# Analyze components and update class map
bun run generate:semantic-analyze

# Generate semantic CSS from class map
bun run generate:semantic-css

# Transform HTML to semantic HTML
bun run generate:semantic-transform

# Run all generation steps at once
bun run generate:ui
```

## Directory Structure

```
generations/semantic-ui/
├── cli.ts                # Command-line tool for analysis and generation
├── classMap.json         # Generated mapping of utility classes to semantic names
├── semantic.css          # Generated CSS with @apply directives
├── result/               # Output directory for transformed components
│   └── HeroSplit.tsx     # Component with semantic class names
└── resolved/             # Directory for components that can be analyzed
    └── HeroSplit.tsx     # Source component with utility classes
```

## How It Works

### 1. Component Analysis

The tool scans components specified in the configuration (in `cli.ts`) and extracts all `className` attributes along with their associated HTML tags:

```typescript
// Configuration in cli.ts
components: [
  {
    path: './generations/semantic-ui/resolved/HeroSplit.tsx',
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
- Separates responsive modifiers (e.g., `sm:`, `lg:`) from base classes

### 3. Semantic Mapping

A key is generated for each unique combination of tag and utility classes:

```typescript
// Example key generation
tag: "div", classes: "flex flex-col gap-4" → "div-flex-flex-col-gap-4"
```

This key is then mapped to the original utility classes in `classMap.json`:

```json
{
  "div-flex-flex-col-gap-4": "flex flex-col gap-4",
  "section-w-full-py-16-lg-py-32": "w-full py-16 lg:py-32"
}
```

You can manually edit this file to provide more meaningful semantic names:

```json
{
  "hero-content": "flex flex-col gap-4",
  "section-hero": "w-full py-16 lg:py-32"
}
```

### 4. CSS Generation

The tool generates CSS using Tailwind's `@apply` directive:

```css
.hero-content { @apply flex flex-col gap-4; }
.section-hero { @apply w-full py-16 lg:py-32; }
```

This CSS is saved to `semantic.css` and can be imported into your project.

### 5. Component Transformation

The tool can transform your components to use semantic class names:

```jsx
// Before transformation
<div className="flex flex-col gap-4">

// After transformation
<div className="hero-content">
```

Transformed components are saved to the `result/` directory.

## Workflow in Detail

### Development Phase

1. Create your components using Tailwind utility classes in the `resolved/` directory
2. Design and iterate quickly using utility-first approach

### Analysis Phase

1. Run `bun run generate:semantic-analyze` to scan components
2. The tool generates `classMap.json` with automatic keys

### Customization Phase

1. Edit `classMap.json` to provide meaningful semantic names
2. Replace auto-generated keys like `div-flex-flex-col-gap-4` with semantic names like `hero-content`
3. Group related styles under consistent naming patterns

### Production Phase

1. Run `bun run generate:semantic-css` to generate the CSS
2. Run `bun run generate:semantic-transform` to create components with semantic classes
3. Use the transformed components and CSS in your production build

### All-in-One Command

Run `bun run generate:ui` to execute all steps at once:
- Analyze components
- Generate CSS
- Transform components

## Class Naming Strategies

### Component-Based Naming

Name classes based on the component they belong to:

```
hero-content
hero-title
hero-image
```

### Function-Based Naming

Name classes based on their function:

```
flex-columns
section-padding
card-shadow
```

### BEM-Inspired Naming

Use Block-Element-Modifier pattern:

```
card
card__header
card__content
card--featured
```

## Tips for Effective Use

1. **Start Simple**: Begin with a small component to understand the workflow
2. **Be Consistent**: Use a consistent naming convention across your project
3. **Think in Components**: Group related styles under component-specific prefixes
4. **Refine Iteratively**: Gradually improve your semantic names as your design system evolves
5. **Document Patterns**: Keep a record of your naming patterns for team reference

## Handling Duplicates

The tool automatically handles duplicate utility patterns:

1. If the same utility pattern appears in multiple places, it will use the same semantic name
2. When you rename a pattern in `classMap.json`, all instances will use the new name
3. The CSS generator deduplicates entries to avoid redundant styles

## Advanced Usage

### Adding New Components

To add a new component for analysis:

1. Add the component to the `resolved/` directory
2. Update the `components` array in `cli.ts`:

```typescript
components: [
  {
    path: './generations/semantic-ui/resolved/HeroSplit.tsx',
    name: 'HeroSplit',
  },
  {
    path: './generations/semantic-ui/resolved/NewComponent.tsx',
    name: 'NewComponent',
  },
],
```

3. Run the analysis again

### Customizing Tag Detection

The tool detects HTML tags from the context. You can customize the detection rules in `cli.ts`:

```typescript
tagDetection: {
  contextMap: {
    '<h1': 'h1',
    '<h2': 'h2',
    // Add custom tag detection patterns here
  },
  contextLines: 3,
  defaultTag: 'div',
},
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- Support for additional component types and frameworks
- Intelligent semantic name suggestions based on component context
- Integration with design token systems
- Visual editor for class mapping refinement
- Automatic detection of common UI patterns