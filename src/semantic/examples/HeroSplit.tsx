import { BookOpen, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "../components/Button";

type Content = {
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  title: string;
  description: string;
  buttons?: {
    id: string;
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
    size?: "sm" | "default" | "lg";
    icon?: React.ReactNode;
  }[];
  images: {
    grid: {
      items: {
        id: string;
        src: string;
      }[];
    };
  };
};

const content: Content = {
  badge: {
    text: "We're building",
    variant: "outline"
  },
  title: "Build with shadcn ui components",
  description: "Beautifully designed components built with Radix UI and Tailwind CSS. Open source and free to use in your applications.",
  buttons: [
    {
      id: "button1",
      text: "Documentation",
      variant: "default",
      size: "lg",
      icon: <BookOpen />
    },
    {
      id: "button2",
      text: "GitHub",
      variant: "outline",
      size: "lg",
      icon: <Github />
    }
  ],
  images: {
    grid: {
      items: [
        {
          id: "image1",
          src: "https://placehold.co/600x400"
        },
        {
          id: "image2",
          src: "https://placehold.co/600x400"
        },
        {
          id: "image3",
          src: "https://placehold.co/600x400"
        }
      ]
    }
  },
} as const;

type HeroSplitProps = React.ComponentPropsWithoutRef<"section"> & Partial<Content>;

export const HeroSplit = (props: HeroSplitProps) => {
  const { badge, title, description, buttons, images } = {
    ...content,
    ...props,
  };

  return (
    <section className="section-hero">
      <div className="container-standard">
        <div className="grid-hero">
          <div className="content-column">
            {badge &&
              <div className="badge-container">
                <Badge variant={badge.variant}>{badge.text}</Badge>
              </div>
            }
            <div className="text-content">
              <h2 className="hero-title">
                {title}
              </h2>
              <p className="hero-description">
                {description}
              </p>
            </div>
            <div className="buttons-container">
              {buttons?.map((button) => (
                <Button 
                  key={button.id} 
                  size={button.size} 
                  variant={button.variant}
                >
                  {button.text} {button.icon}
                </Button>
              ))}
            </div>
          </div>
          <div className="images-grid">
            {images.grid.items?.map((image, index) => (
              <div key={image.id} className={`image-container ${index === 1 ? 'image-tall' : 'image-square'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 