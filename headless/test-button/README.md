# Button Component System

This project demonstrates an atomic design approach to building UI components, showcasing three levels of abstraction for a Button component:

## Architecture

### Atom: Headless Button

Located in the `atom` directory, this is a completely unstyled button with a custom Slot implementation. The Slot component allows for component composition and is not dependent on Radix UI.

Key features:
- Custom Slot implementation with `composeRefs` utility
- No styling dependencies (uses vanilla-extract/css)
- Fully accessible and type-safe

### Molecule: Tailwind Button

Located in the `molecule` directory, this component builds on the headless button by adding styling using tailwind-variants.

Key features:
- Imports the headless button
- Adds styling using tailwind-variants
- Supports variants (primary, secondary, etc.) and sizes (sm, md, lg)

### Organism: Semantic Button

Located in the `organism` directory, this is the final abstraction that uses semantic class names.

Key features:
- Imports the molecule button
- Uses semantic class naming (button-primary, button-sm, etc.)
- Can be easily converted to pure CSS

## Usage

### Headless Button (Atom)

```tsx
import { Button } from "@test-button/atom";

<Button onClick={() => console.log("Clicked!")}>
  Click Me
</Button>

// Using with asChild
<Button asChild>
  <a href="#">Link Button</a>
</Button>
```

### Tailwind Button (Molecule)

```tsx
import { Button } from "@test-button/molecule";

<Button variant="primary" size="md">
  Primary Button
</Button>

<Button variant="secondary" size="sm">
  Secondary Button
</Button>
```

### Semantic Button (Organism)

```tsx
import { Button } from "@test-button/organism";

<Button variant="primary" size="md">
  Primary Button
</Button>
```

## Custom Slot Implementation

The custom Slot implementation allows for component composition without relying on Radix UI. It:

1. Merges props (onClick, className, style, etc.)
2. Composes refs correctly
3. Works with any React element
4. Supports React 19+ 