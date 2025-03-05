# UI Factory

A modern approach to React component development with support for multiple styling systems and automatic CSS generation.

## Key Features

- **Multiple Styling Systems**: Support for Quark (atomic) and Semantic class naming
- **Automatic Parsing**: Extract classes from components using RegEx
- **CSS Generation**: Automatic creation of optimized stylesheets
- **Headless Components**: Base components without styles
- **TypeScript**: Full type support

## Project Structure

```bash
packages/
  ├── ui-parser/        # CLI utility for analysis and transformation
  ├── ui-headless/      # Base unstyled components
  └── app/              # Demo application
```

## UI Parser

### Installation

```bash
bun install
```

### CLI Commands

```bash
# Analyze components and extract classes
bun ui-parser:analyze -s ./src/source -o ./src/components

# Generate CSS files
bun ui-parser:generate -s ./src/source -o ./src/styles

# Transform components to Quark/Semantic versions
bun ui-parser:transform -s ./src/source -o ./src/components

# Run all steps in sequence
bun ui-parser:all -s ./src/source -o ./src/components
```

### RegEx Adapter

The RegEx adapter automatically extracts classes from your components by analyzing:

- JSX className attributes
- Tailwind class constants
- tailwind-variants configurations
- Dynamic class expressions
- Template literals

Example component:

```tsx
const buttonVariants = tv({
  base: "rounded-md px-4 py-2",
  variants: {
    size: {
      sm: "text-sm",
      lg: "text-lg"
    }
  }
});

export function Button({ size }) {
  return (
    <button className={buttonVariants({ size })}>
      Click me
    </button>
  );
}
```

The adapter will extract all classes and generate both Quark and Semantic versions.

### Generated Output

For each component, UI Parser generates:

1. **Quark Version** (`ComponentName.quark.tsx`)
   - Uses atomic class names
   - Optimized for reusability
   - Example: `flex items-center justify-between`

2. **Semantic Version** (`ComponentName.semantic.tsx`)
   - Uses semantic class names
   - Better readability
   - Example: `header-container`

3. **CSS Files**
   - `quark.css`: Atomic styles
   - `semantic.css`: Semantic styles

### Using Generated Components

Import styles in your main CSS file:

```css
/* Base styles */
@import "./styles/base.css";

/* Components */
@import "./styles/components/navigation.css";

/* Semantic */
@import "./components/semantic.css";

/* Quark */
@import "./components/quark.css";
```

Use components in your application:

```tsx
import { HeroSplitQuark } from "@/components/HeroSplit.quark";
import { HeroSplitSemantic } from "@/components/HeroSplit.semantic";
import { HeroSplit } from "@/source/HeroSplit";

export default function App() {
  return (
    <div className="font-sans bg-background text-foreground antialiased">
      <div className="container mx-auto px-4">
        {/* Original component */}
        <HeroSplit />
        
        {/* Quark version */}
        <HeroSplitQuark />
        
        {/* Semantic version */}
        <HeroSplitSemantic />
      </div>
    </div>
  );
}
```

## Headless UI (@ui-headless)

The `@ui-headless` package provides unstyled base components that can be used as a foundation for your styled components.

### Features

- Zero default styles
- Full accessibility support
- Flexible composition with Slot pattern
- Complete TypeScript types

### Available Components

- `Button`: Base button component with ref forwarding
- `Slot`: Component composition utility
- More components coming soon...

### Usage Example

```tsx
import { Button } from "@ui-factory/ui-headless";

// Use with Quark classes
export function PrimaryButton({ children }) {
  return (
    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      {children}
    </Button>
  );
}

// Use with Semantic classes
export function SecondaryButton({ children }) {
  return (
    <Button className="button-secondary">
      {children}
    </Button>
  );
}
```

### Slot Pattern

The Slot component allows you to compose components while maintaining proper prop and ref forwarding:

```tsx
import { Slot } from "@ui-factory/ui-headless";

export function Container({ asChild, children, ...props }) {
  return (
    <Slot asChild={asChild} {...props}>
      {children}
    </Slot>
  );
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.

## License

MIT