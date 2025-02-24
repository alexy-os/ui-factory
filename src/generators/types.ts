export interface PageConfig {
  path: string;           // Path to the output HTML file
  component: React.ComponentType;  // React component for rendering
  props?: Record<string, unknown>; // Props for the component
  styles?: string[];     // Additional styles for the page
}

export interface BuilderConfig {
  outDir: string;        // Directory for output files
  templates: PageConfig[]; // Page configurations
  defaultStyles?: string[]; // Base styles for all pages
} 