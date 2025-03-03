import React from "react";
import { BookOpen, Github } from "lucide-react";
import { Badge, type BadgeProps } from "@ui-factory/ui-shadcn/components/ui/badge";
import { Button, type ButtonProps } from "@ui-factory/ui-shadcn/components/ui/button";

type Content = {
  badge?: BadgeProps & {
    text: string;
  };
  title: string;
  description: string;
  buttons?: (ButtonProps & {
    id: string;
    text: string;
    icon?: React.ReactNode;
  })[];
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
  badge: {
    text: "We're building",
    variant: "outline",
    className: "badge text-sm font-medium"
  },
  title: "Build with shadcn ui components",
  description: "Beautifully designed components built with Radix UI and Tailwind CSS. Open source and free to use in your applications.",
  buttons: [
    {
      id: "button1",
      text: "Documentation",
      variant: "default",
      size: "lg",
      className: "items-center gap-2",
      icon: <BookOpen />
    },
    {
      id: "button2",
      text: "GitHub",
      variant: "outline",
      size: "lg",
      className: "items-center gap-2",
      icon: <Github />
    }
  ],
  images: {
    grid: {
      className: "grid grid-cols-2 gap-8",
      items: [
        {
          id: "image1",
          src: "https://placehold.co/600x400",
          className: "bg-muted rounded-md aspect-square"
        },
        {
          id: "image2",
          src: "https://placehold.co/600x400",
          className: "bg-muted rounded-md row-span-2"
        },
        {
          id: "image3",
          src: "https://placehold.co/600x400",
          className: "bg-muted rounded-md aspect-square"
        }
      ]
    }
  },
} as const;

type HeroSplitWithGalleryProps = React.ComponentPropsWithoutRef<"section"> & Partial<Content>;

export const HeroSplit = (props: HeroSplitWithGalleryProps) => {
  const { badge, title, description, buttons, images } = {
    ...content,
    ...props,
  };

  return ( 
  <section className="semantic-herosplit-section-py-32-py-16-w-full">
    <div className="semantic-herosplit-div-container-px-8-px-6-mx-auto-px-4">
      <div className="semantic-herosplit-div-gap-8-grid-grid-cols-1-items-center-grid-cols-2">
        <div className="semantic-herosplit-div-flex-flex-col-gap-4">
          {badge &&
          <div className="semantic-herosplit-div-flex-justify-center">
            <Badge variant="outline">{badge.text}</Badge>
          </div>
          }
          <div className="semantic-herosplit-div-flex-flex-col-gap-4">
            <h2 className="semantic-herosplit-h2-font-bold-text-5xl-max-w-2xl-text-4xl-text-3xl">
                {title}
            </h2>
            <p className="semantic-herosplit-p-max-w-2xl-text-base-text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="semantic-herosplit-div-flex-flex-col-gap-4-gap-8-flex-row-gap-6">
            {buttons?.map((button) => (
              <Button key={button.id} size={button.size} className={button.className} variant={button.variant}>
                {button.text} {button.icon}
              </Button>
            ))}
          </div>
        </div>
        <div className="semantic-herosplit-div-gap-8-grid-grid-cols-2">
          {images.grid.items?.map((image) => (
            <div key={image.id} className={image.className}></div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
};