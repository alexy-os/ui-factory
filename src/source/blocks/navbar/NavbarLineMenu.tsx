import { BookOpen, Layers, Github } from "lucide-react";
import { Button } from "@/source/ui/Button";

type Content = {
  brand: {
    name: string;
    icon: React.ReactNode;
  };
  navigation: {
    id: string;
    path: string;
    label: string;
    icon: React.ReactNode;
  }[];
  actions: {
    id: string;
    path: string;
    label: string;
    icon: React.ReactNode;
  }[];
};

const content: Content = {
  brand: {
    name: "Buildy/UI",
    icon: <Layers className="h-5 w-5" />,
  },
  navigation: [
    {
      id: "docs",
      path: "https://ui.hinddy.com/docs",
      label: "Documentation",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      id: "components",
      path: "https://ui.hinddy.com/components",
      label: "Components",
      icon: <Layers className="h-5 w-5" />,
    },
  ],
  actions: [
    {
      id: "github",
      path: "https://github.com/alexy-os/react-shadcn-uiblocks",
      label: "GitHub",
      icon: <Github className="h-5 w-5" />,
    },
  ],
} as const;

const Brand = () => {
  const { name } = content.brand;
  return (
    <div className="flex items-center gap-2">
      <Layers className="h-5 w-5" />
      <span className="font-semibold">{name}</span>
    </div>
  );
};

const HeroSection = () => (
  <section className="w-full py-16 lg:py-32">
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex flex-col text-center gap-8 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="max-w-2xl text-3xl md:text-4xl lg:text-6xl font-bold">
            Effortless Prototyping
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Streamline your development process with our flexible UI library.
            Experience effortless prototyping and create custom, responsive
            designs quickly and efficiently.
          </p>
        </div>
      </div>
    </div>
  </section>
);

type NavbarProps = React.ComponentPropsWithoutRef<"header"> & Partial<Content>;

export const NavbarLineMenu = (props: NavbarProps) => {
  const { navigation, actions } = {
    ...content,
    ...props,
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full border-b bg-background/95">
        <div className="container mx-auto px-4 flex h-14 items-center">
          <div className="mr-4 flex">
            <Brand />
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Button key={item.id} variant="ghost" asChild>
                <a href={item.path}>
                  {item.label}
                </a>
              </Button>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-2">

            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="hidden md:flex"
                asChild
              >
                <a href={action.path}>
                  {action.icon}
                  {action.label}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </header>
      <HeroSection />
    </>
  );
};