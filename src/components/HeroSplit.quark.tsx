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
  <section className="q-p3p1wf">
    <div className="q-cp8p6map4">
      <div className="q-g8ggc1icgc2">
        <div className="q-ffcg4">
          {badge &&
          <div className="q-fjc">
            <Badge variant="outline">{badge.text}</Badge>
          </div>
          }
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
              <Button key={button.id} size={button.size} className={button.className} variant={button.variant}>
                {button.text} {button.icon}
              </Button>
            ))}
          </div>
        </div>
        <div className="q-g8ggc2">
          {images.grid.items?.map((image) => (
            <div key={image.id} className={image.className}></div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
};