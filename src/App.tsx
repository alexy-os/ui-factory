//import { HeroSplit } from "@/components/HeroSplit.quark";
//import { HeroSplit } from "@/components/HeroSplit.semantic";
import { HeroSplit } from "@/source/HeroSplit";

export default function App() {
  return (
    <div className="font-sans bg-background text-foreground antialiased">
      <div className="container mx-auto px-4">
        <HeroSplit />
      </div>
    </div>
  )
} 