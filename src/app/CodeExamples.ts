export const codeExamples = {
  utility: `import React from "react";
import { Button } from "./Button";
import { BookOpen, Github } from "lucide-react";

export const HeroSplit = () => {
  return ( 
    <section className="w-full py-16 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          <div className="flex gap-4 flex-col">
            <div className="flex justify-center">
              <Button variant="outline" className="text-sm font-medium">
                Styling Approach
              </Button>
            </div>
            <div className="flex gap-4 flex-col">
              <h2 className="max-w-2xl text-3xl md:text-4xl lg:text-5xl font-bold">
                Three Ways to Style Components
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl">
                Explore different styling approaches: from utility-first classes for maximum flexibility, 
                semantic class names for better readability, to optimized quark classes for production. 
                Choose what works best for your project.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
              <Button variant="default" size="lg" className="items-center gap-2">
                Documentation <BookOpen />
              </Button>
              <Button variant="outline" size="lg" className="items-center gap-2">
                GitHub <Github />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-muted rounded-md aspect-square" />
            <div className="bg-muted rounded-md row-span-2" />
            <div className="bg-muted rounded-md aspect-square" />
          </div>
        </div>
      </div>
    </section>
  );
};`,

  semantic: `import React from "react";
import { Button } from "./Button.semantic";
import { BookOpen, Github } from "lucide-react";

export const HeroSplit = () => {
  return ( 
    <section className="section-full">
      <div className="container">
        <div className="herosplit-grid-cols">
          <div className="herosplit-flex-col">
            <div className="herosplit-justify-center">
              <Button variant="outline" className="button-sm-medium">
                Styling Approach
              </Button>
            </div>
            <div className="herosplit-flex-col">
              <h2 className="h2-title">
                Three Ways to Style Components
              </h2>
              <p className="herosplit-description">
                Explore different styling approaches: from utility-first classes for maximum flexibility, 
                semantic class names for better readability, to optimized quark classes for production. 
                Choose what works best for your project.
              </p>
            </div>
            <div className="herosplit-buttons">
              <Button variant="default" size="lg" className="button-items-center">
                Documentation <BookOpen />
              </Button>
              <Button variant="outline" size="lg" className="button-items-center">
                GitHub <Github />
              </Button>
            </div>
          </div>
          <div className="button-grid-cols">
            <div className="herosplit-img-aspect-square" />
            <div className="herosplit-img-rounded" />
            <div className="herosplit-img-aspect-square" />
          </div>
        </div>
      </div>
    </section>
  );
};`,

  quark: `import React from "react";
import { Button } from "./Button.quark";
import { BookOpen, Github } from "lucide-react";

export const HeroSplit = () => {
  return (
  <section className="n1w33">
    <div className="jsre0">
      <div className="dtc0c">
        <div className="q2o02">
          <div className="5adda"><Button
              className="sdf5g">Styling
              Approach</Button></div>
          <div className="q2o02">
            <h2 className="wsujb">Three Ways to Style Components</h2>
            <p className="xi0r2">Explore different styling approaches: from utility-first class for maximum flexibility,
              semantic className names for better readability, to optimized quark class for production. Choose what works
              best for your project.</p>
          </div>
          <div className="2rm3d">
            <Button className="i3hv4">
              Documentation <BookOpen />
            </Button>
            <Button className="jh43b">
              GitHub <Github />
            </Button>
          </div>
        </div>
        <div className="hg3vj">
          <div className="ssfv4"></div>
          <div className="7hd8j"></div>
          <div className="h7gh4"></div>
        </div>
      </div>
    </div>
  </section>
  );
};`
}; 