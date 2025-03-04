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
    className: "text-sm font-medium"
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
  <section className="w-full py-16 lg:py-32">
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        <div className="flex gap-4 flex-col">
          {badge &&
          <div className="flex justify-center">
            <Badge variant="outline">{badge.text}</Badge>
          </div>
          }
          <div className="flex gap-4 flex-col">
            <h2 className="max-w-2xl text-3xl md:text-4xl lg:text-5xl font-bold">
                {title}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl">
              {description}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
            {buttons?.map((button) => (
              <Button key={button.id} size={button.size} className={button.className} variant={button.variant}>
                {button.text} {button.icon}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {images.grid.items?.map((image) => (
            <div key={image.id} className={image.className}></div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
};