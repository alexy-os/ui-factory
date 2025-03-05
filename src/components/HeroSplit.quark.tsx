import React from "react";
import { BookOpen, Github } from "lucide-react";
import { Button } from "./Button.quark";
import type { ButtonProps } from "./Button.quark";

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
    text: "We're building",
    variant: "outline",
    className: "q-fmts"
  },
  title: "Quark UI with shadcn ui components",
  description: "Beautifully designed components built with Radix UI and Tailwind CSS. Open source and free to use in your applications.",
  buttons: [
    {
      id: "button1",
      text: "Documentation",
      variant: "default",
      size: "lg",
      className: "q-g2ic",
      icon: <BookOpen />
    },
    {
      id: "button2",
      text: "GitHub",
      variant: "outline",
      size: "lg",
      className: "q-g2ic",
      icon: <Github />
    }
  ],
  images: {
    grid: {
      className: "q-g8ggc2",
      items: [
        {
          id: "image1",
          src: "https://placehold.co/600x400",
          className: "q-asbmrm"
        },
        {
          id: "image2",
          src: "https://placehold.co/600x400",
          className: "q-bmrmrs2"
        },
        {
          id: "image3",
          src: "https://placehold.co/600x400",
          className: "q-asbmrm"
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
    <section className="q-p3p1wf" {...rest}>
      <div className="q-cp8p6map4">
        <div className="q-g8ggc1icgc2">
          <div className="q-ffcg4">
            {button && (
              <div className="q-fjc">
                <Button variant={button.variant} className={button.className}>
                  {button.text}
                </Button>
              </div>
            )}
            <div className="q-ffcg4">
              <h2 className="q-fbt5mw2t4t3">
                {title}
              </h2>
              <p className="q-mw2tbtmf">
                {description}
              </p>
            </div>
            <div className="q-ffcg4g8frg6">
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
export { HeroSplit as HeroSplitQuark };
export default HeroSplit;
