# Semantic UI Generator

A powerful tool for transforming Tailwind utility classes into semantic class names, enabling better maintainability and readability of your UI components.

## Overview

Semantic UI Generator analyzes your React components, extracts Tailwind utility classes, and generates a mapping to semantic class names. This approach combines the rapid development benefits of utility-first CSS with the maintainability advantages of semantic class names.

## Key Features

- **Automatic Class Analysis**: Scans your components to extract Tailwind utility classes
- **Semantic Name Generation**: Creates meaningful class names based on HTML tags and utility patterns
- **CSS Generation**: Produces optimized CSS with `@apply` directives
- **Customizable Mapping**: Allows manual refinement of semantic names
- **Web Interface**: Visual tool for reviewing and managing class mappings

## Getting Started

### Installation

No additional installation is required if you're already in the UI Factory project. The tool is integrated into the project's scripts.

### Usage

From the root directory of the project, you can run:

```bash
# Start the web interface
bun run dev:semantic-ui

# Analyze components and update class map
bun run generate:semantic-analyze

# Generate semantic CSS from class map
bun run generate:semantic-css
```

## How It Works

1. **Analysis Phase**: The tool scans your React components (starting with `src/examples/HeroSplit.tsx`) and extracts all `className` attributes along with their associated HTML tags.

2. **Normalization**: Utility classes are normalized and combined into predictable keys:
   - Classes are merged and deduplicated using `tailwind-merge` and `clsx`
   - Responsive modifiers (e.g., `sm:`, `lg:`) are converted to hyphenated format
   - Classes are sorted alphabetically to ensure consistent key generation

3. **Mapping**: A key is generated for each unique combination of tag and utility classes, which is then mapped to a semantic name.

4. **CSS Generation**: The tool generates CSS using Tailwind's `@apply` directive, allowing you to use semantic class names while leveraging Tailwind's utility classes.

## Benefits

- **Improved Readability**: Semantic class names like `hero-content` are more meaningful than utility combinations like `flex gap-4 flex-col`
- **Better Maintainability**: Changes to design tokens or styling patterns can be managed in one place
- **Reduced Bundle Size**: Final CSS can be optimized and minified more effectively
- **Progressive Enhancement**: Start with utility classes during rapid development, then refine to semantic names
- **Consistent Naming**: Enforces a standardized approach to component styling across your project

## Use Cases

- **Design System Development**: Create a consistent naming convention for your design system components
- **Large-Scale Applications**: Improve maintainability of complex UI components
- **Legacy Code Migration**: Gradually transform utility-heavy components into more semantic structures
- **Documentation**: Generate better self-documenting UI components

## Workflow Integration

1. **Development Phase**: Use Tailwind utility classes directly for rapid development
2. **Refinement Phase**: Run the analyzer to generate initial semantic mappings
3. **Customization Phase**: Manually refine semantic names in the generated map
4. **Production Phase**: Generate and use the semantic CSS in your production build

## Future Enhancements

- Support for additional component types and frameworks
- Intelligent semantic name suggestions based on component context
- Integration with design token systems
- Visual editor for class mapping refinement

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 