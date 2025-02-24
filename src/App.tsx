import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold">UI Factory</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A collection of reusable UI components from popular React libraries
        </p>
        <Button>Click me</Button>
      </div>
    </div>
  )
} 