import { HeroSplitQuark } from "@/components/HeroSplit.quark";
import { HeroSplitSemantic } from "@/components/HeroSplit.semantic";
import { HeroSplit } from "@/source/HeroSplit";
import { CodePreview } from "@/CodePreview";
import { codeExamples } from "@/CodeExamples";
import { ThemeProvider } from "@/theme-provider";
import { ThemeToggle } from "@/theme-toggle";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="font-sans bg-background text-foreground antialiased min-h-screen">
        <nav className="border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-end">
            <ThemeToggle />
          </div>
        </nav>
        <div className="container mx-auto px-4">
          <div className="my-8 p-6 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Explore Different Styling Approaches
            </h2>
            <p className="text-lg mb-4 text-muted-foreground">
              Open your browser's Developer Tools (Press F12) and inspect each component below to see three different approaches to CSS styling:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold text-foreground">Utility-First:</span> Raw Tailwind classes for maximum flexibility</li>
              <li><span className="font-semibold text-foreground">Semantic:</span> Readable class names describing their purpose</li>
              <li><span className="font-semibold text-foreground">Quark:</span> Optimized atomic classes for production</li>
            </ul>
            <div className="mt-4 p-3 bg-muted/50 rounded border border-border">
              <code className="text-sm">
                💡 Tip: Use the Elements panel to compare the className attributes
              </code>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-12 mb-6">
            <h1 className="text-2xl font-bold">Utility-First Classes</h1>
            <CodePreview code={codeExamples.utility} title="Utility-First Component" />
          </div>
          <HeroSplit />
          
          <div className="flex items-center justify-between mt-12 mb-6">
            <h1 className="text-2xl font-bold">Semantic Classes</h1>
            <CodePreview code={codeExamples.semantic} title="Semantic Component" />
          </div>
          <HeroSplitSemantic />
          
          <div className="flex items-center justify-between mt-12 mb-6">
            <h1 className="text-2xl font-bold">Quark Classes</h1>
            <CodePreview code={codeExamples.quark} title="Quark Component" />
          </div>
          <HeroSplitQuark />
        </div>
      </div>
    </ThemeProvider>
  )
}