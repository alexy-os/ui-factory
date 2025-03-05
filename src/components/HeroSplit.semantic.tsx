import React from "react";
import { BookOpen, Github } from "lucide-react";
import { Button } from "./Button.semantic";
import type { ButtonProps } from "./Button.semantic";

type Content = {
  button?: {
    text: string;
    variant?: ButtonProps["variant"];
    className?: string;
  };
  title: string;
  description: string;
  buttons?: {
    id: string;
    text: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    className?: string;
    icon?: React.ReactNode;
  }[];
  images: {
    grid: {
      className: string;
      items: {
        id: string;
        src: string;
        className: string;
      }[];
    };
  };
};

const content: Content = {
  button: {
    text: "Styling Approach",
    variant: "outline",
    className: "button-sm-medium"
  },
  title: "Three Ways to Style Components",
  description: "Explore different styling approaches: from utility-first classes for maximum flexibility, semantic class names for better readability, to optimized quark classes for production. Choose what works best for your project.",
  buttons: [
    {
      id: "button1",
      text: "Documentation",
      variant: "default",
      size: "lg",
      className: "button-items-center",
      icon: <BookOpen />
    },
    {
      id: "button2",
      text: "GitHub",
      variant: "outline",
      size: "lg",
      className: "button-items-center",
      icon: <Github />
    }
  ],
  images: {
    grid: {
      className: "button-grid-cols",
      items: [
        {
          id: "image1",
          src: "https://placehold.co/600x400",
          className: "herosplit-img-aspect-square"
        },
        {
          id: "image2",
          src: "https://placehold.co/600x400",
          className: "herosplit-img-rounded"
        },
        {
          id: "image3",
          src: "https://placehold.co/600x400",
          className: "herosplit-img-aspect-square"
        }
      ]
    }
  },
} as const;

type HeroSplitWithGalleryProps = React.ComponentPropsWithoutRef<"section"> & Partial<Content>;

const HeroSplit = (props: HeroSplitWithGalleryProps) => {
  const { button, title, description, buttons, images, className, ...rest } = {
    ...content,
    ...props,
  };

  return ( 
    <section className="section-full" {...rest}>
      <div className="container">
        <div className="herosplit-grid-cols">
          <div className="herosplit-flex-col">
            {button && (
              <div className="herosplit-justify-center">
                <Button variant={button.variant} className={button.className}>
                  {button.text}
                </Button>
              </div>
            )}
            <div className="herosplit-flex-col">
              <h2 className="h2-title">
                {title}
              </h2>
              <p className="herosplit-description">
                {description}
              </p>
            </div>
            <div className="herosplit-buttons">
              {buttons?.map((button) => (
                <Button 
                  key={button.id}
                  variant={button.variant}
                  size={button.size}
                  className={button.className}
                >
                  {button.text} {button.icon}
                </Button>
              ))}
            </div>
          </div>
          <div className={images.grid.className}>
            {images.grid.items?.map((image) => (
              <div key={image.id} className={image.className}></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Export with variant name
export { HeroSplit as HeroSplitSemantic };
export default HeroSplit;
