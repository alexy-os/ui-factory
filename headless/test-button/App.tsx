import * as React from "react";
import { Button as MoleculeButton } from "@test-button/molecule";
import { Button as SemanticButton } from "@test-button/organism";

export function App() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Button Component Test</h1>
      
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tailwind Button (Molecule)</h2>
        <div className="flex flex-wrap gap-4">
          <MoleculeButton variant="primary">Primary</MoleculeButton>
          <MoleculeButton variant="secondary">Secondary</MoleculeButton>
          <MoleculeButton variant="outline">Outline</MoleculeButton>
          <MoleculeButton variant="ghost">Ghost</MoleculeButton>
          <MoleculeButton variant="link">Link</MoleculeButton>
        </div>
        <div className="flex flex-wrap gap-4">
          <MoleculeButton variant="primary" size="sm">Small</MoleculeButton>
          <MoleculeButton variant="primary" size="md">Medium</MoleculeButton>
          <MoleculeButton variant="primary" size="lg">Large</MoleculeButton>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Semantic Button (Organism)</h2>
        <div className="flex flex-wrap gap-4">
          <SemanticButton variant="primary">Primary</SemanticButton>
          <SemanticButton variant="secondary">Secondary</SemanticButton>
          <SemanticButton variant="outline">Outline</SemanticButton>
          <SemanticButton variant="ghost">Ghost</SemanticButton>
          <SemanticButton variant="link">Link</SemanticButton>
        </div>
        <div className="flex flex-wrap gap-4">
          <SemanticButton variant="primary" size="sm">Small</SemanticButton>
          <SemanticButton variant="primary" size="md">Medium</SemanticButton>
          <SemanticButton variant="primary" size="lg">Large</SemanticButton>
        </div>
      </div>
    </div>
  );
} 