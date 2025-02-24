# UI Factory

A modern approach to building static websites using React components and CSS-only interactions.

## Core Concept

UI Factory combines the power of React components for building UI with pure CSS interactions, generating static HTML files without JavaScript dependencies. This approach provides better performance and accessibility while maintaining modern development practices.

## Key Features

- **Static Site Generation**: Convert React components into pure HTML
- **CSS-only Interactions**: Modern CSS3 features for interactive elements
- **Component Library**: Built with shadcn/ui components
- **Zero JavaScript**: No runtime JavaScript required
- **Dark Mode Support**: CSS variables based theming
- **Modern Styling**: Powered by Tailwind CSS
- **Type Safety**: Full TypeScript support

## Architecture

### Component Building
- React components are used as templates
- shadcn/ui provides base UI components
- Custom sections and layouts are composed from base components
- All interactive elements use CSS-only solutions

### Style System
- CSS modules for component-specific styles
- Tailwind CSS for utility classes
- CSS variables for theming
- Pure CSS interactions (off-canvas, dropdowns, etc.)

### Build Process
1. Components are rendered to static HTML
2. Styles are processed and optimized
3. Final assets are generated without JavaScript

## Getting Started

### Installation
```bash
bun install
```

### Development
```bash
bun run dev
```

### Build
```bash
bun run generate
```
This command:
1. Generates optimized CSS (`generate:styles`)
2. Converts components to static HTML (`generate:html`)

## Usage Example

```typescript
// Define a page template
const templates = [
  {
    path: 'index.html',
    component: NavbarMegaMenu
  }
];

// Generate static files
const builder = new StaticBuilder({ templates });
await builder.build();
```

## CSS-only Interactions

Example of off-canvas menu implementation:
```css
.off-canvas {
  @apply fixed inset-y-0 right-0 transform translate-x-full transition-transform;
}

#mobile-menu-toggle:checked ~ .off-canvas {
  transform: translateX(0);
}
```

## Project Structure
```
src/
  ├── components/     # Base UI components
  ├── examples/       # Page templates
  ├── generators/     # Static site generator
  └── styles/        # CSS modules and utilities
      ├── base.css   # Core styles
      ├── components/# Component styles
      └── shadcn/    # shadcn/ui styles
```

## Benefits

- **Performance**: No JavaScript overhead
- **Accessibility**: Native HTML elements
- **SEO-friendly**: Clean, semantic HTML
- **Maintainable**: Modular component structure
- **Developer Experience**: Modern tools and TypeScript

## License

MIT
