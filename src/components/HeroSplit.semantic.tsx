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
    text: "We're building",
    variant: "outline",
    className: "s-herosplit-button-font-medium-text-sm"
  },
  title: "Build with shadcn ui components",
  description: "Beautifully designed components built with Radix UI and Tailwind CSS. Open source and free to use in your applications.",
  buttons: [
    {
      id: "button1",
      text: "Documentation",
      variant: "default",
      size: "lg",
      className: "s-herosplit-button-gap-2-items-center",
      icon: <BookOpen />
    },
    {
      id: "button2",
      text: "GitHub",
      variant: "outline",
      size: "lg",
      className: "s-herosplit-button-gap-2-items-center",
      icon: <Github />
    }
  ],
  images: {
    grid: {
      className: "s-herosplit-button-gap-8-grid-grid-cols-2",
      items: [
        {
          id: "image1",
          src: "https://placehold.co/600x400",
          className: "s-herosplit-img-aspect-square-bg-muted-rounded-md"
        },
        {
          id: "image2",
          src: "https://placehold.co/600x400",
          className: "s-herosplit-img-bg-muted-rounded-md-row-span-2"
        },
        {
          id: "image3",
          src: "https://placehold.co/600x400",
          className: "s-herosplit-img-aspect-square-bg-muted-rounded-md"
        }
      ]
    }
  },
} as const;

type HeroSplitWithGalleryProps = React.ComponentPropsWithoutRef<"section"> & Partial<Content>;

export const HeroSplit = (props: HeroSplitWithGalleryProps) => {
  const { button, title, description, buttons, images, className, ...rest } = {
    ...content,
    ...props,
  };

  return ( 
    <section className="s-herosplit-section-py-32-py-16-w-full" {...rest}>
      <div className="s-herosplit-div-container-px-8-px-6-mx-auto-px-4">
        <div className="s-herosplit-div-gap-8-grid-grid-cols-1-items-center-grid-cols-2">
          <div className="s-herosplit-div-flex-flex-col-gap-4">
            {button && (
              <div className="s-herosplit-div-flex-justify-center">
                <Button variant={button.variant} className={button.className}>
                  {button.text}
                </Button>
              </div>
            )}
            <div className="s-herosplit-div-flex-flex-col-gap-4">
              <h2 className="s-herosplit-h2-font-bold-text-5xl-max-w-2xl-text-4xl-text-3xl">
                {title}
              </h2>
              <p className="s-herosplit-p-max-w-2xl-text-base-text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="s-herosplit-div-flex-flex-col-gap-4-gap-8-flex-row-gap-6">
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