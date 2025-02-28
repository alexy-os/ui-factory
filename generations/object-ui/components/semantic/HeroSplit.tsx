import { BookOpen, Github } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";

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
  <section className="section-full">
    <div className="section-container">
      <div className="section-columns">
        <div className="section-column">
          {badge &&
          <div className="flex-center">
            <Badge variant="outline">{badge.text}</Badge>
          </div>
          }
          <div className="section-column">
            <h2 className="h2-title">
                {title}
            </h2>
            <p className="description">
              {description}
            </p>
          </div>
          <div className="flex-column">
            {buttons?.map((button) => (
              <Button key={button.id} size={button.size} className={button.className} variant={button.variant}>
                {button.text} {button.icon}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid-columns">
          {images.grid.items?.map((image) => (
            <div key={image.id} className={image.className}></div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
};