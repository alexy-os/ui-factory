import * as React from "react";
import { Menu, BookOpen, Layers, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { HeroSplit } from "./HeroSplit";

type Content = {
  brand: {
    name: string;
    icon: React.ReactNode;
  };
  navigation: {
    main: {
      id: string;
      label: string;
      subItems: {
        id: string;
        title: string;
        description: string;
        href: string;
      }[];
    }[];
    static: {
      id: string;
      path: string;
      label: string;
      icon: React.ReactNode;
    }[];
  };
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
  navigation: {
    main: [
      {
        id: "getting-started",
        label: "Getting Started",
        subItems: [
          {
            id: "intro",
            title: "Introduction",
            description:
              "Re-usable components built using Radix UI and Tailwind CSS",
            href: "#",
          },
          {
            id: "install",
            title: "Installation",
            description:
              "How to install dependencies and structure your app",
            href: "#",
          },
        ],
      },
      {
        id: "components",
        label: "Components",
        subItems: [
          {
            id: "alert-dialog",
            title: "Alert Dialog",
            description:
              "A modal dialog that interrupts the user with important content",
            href: "#",
          },
          {
            id: "hover-card",
            title: "Hover Card",
            description: "Preview content available behind a link",
            href: "#",
          },
        ],
      },
    ],
    static: [
      {
        id: "docs",
        path: "#",
        label: "Documentation",
        icon: <BookOpen className="h-5 w-5" />,
      },
    ],
  },
  actions: [
    {
      id: "github",
      path: "#",
      label: "GitHub",
      icon: <Github className="h-5 w-5" />,
    },
  ],
} as const;

type ListItemProps = React.ComponentPropsWithoutRef<"a"> & {
  title: string;
  href?: string;
};

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ title, children, href, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href || ""}
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
);
ListItem.displayName = "ListItem";

const Brand = () => {
  const { name } = content.brand;
  return (
    <div className="flex items-center gap-2">
      <Layers className="h-5 w-5" />
      <span className="font-semibold">{name}</span>
    </div>
  );
};

const MobileNavigation = () => {
  return (
    <>
      {/* Hidden checkbox for controlling the menu */}
      <input type="checkbox" id="mobile-menu-toggle" />
      
      {/* Burger menu button */}
      <label 
        htmlFor="mobile-menu-toggle"
        className="md:hidden p-2 hover:bg-accent rounded-md cursor-pointer"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </label>

      {/* Overlay */}
      <label 
        htmlFor="mobile-menu-toggle" 
        className="off-canvas-overlay"
      />
      
      {/* Mobile menu */}
      <div className="off-canvas">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Brand />
            <label 
              htmlFor="mobile-menu-toggle"
              className="p-2 hover:bg-accent rounded-md cursor-pointer"
            >
              ✕
            </label>
          </div>

          <nav className="space-y-2">
            {content.navigation.main.map((section, index) => (
              <div key={section.id} className="mobile-menu-item">
                {/* Чекбокс для подменю */}
                <input 
                  type="checkbox" 
                  id={`submenu-toggle-${index}`} 
                  className="submenu-toggle hidden" 
                />
                
                {/* Submenu title */}
                <label 
                  htmlFor={`submenu-toggle-${index}`}
                  className="w-full text-left p-3 hover:bg-accent rounded-md flex justify-between items-center cursor-pointer"
                >
                  {section.label}
                  <svg 
                    className="h-4 w-4 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </label>

                {/* Submenu */}
                <div className="submenu">
                  {section.subItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      className="block p-2 hover:bg-accent rounded-md"
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

const DesktopNavigation = () => (
  <nav className="hidden md:block">
    <ul className="flex gap-6">
      {content.navigation.main.map((navItem) => (
        <li key={navItem.id} className="group relative">
          <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-accent-foreground">
            {navItem.label}
            <svg 
              className="h-4 w-4 transition-transform group-hover:rotate-180" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute left-0 top-full z-50 hidden w-64 rounded-lg bg-background p-4 shadow-lg ring-1 ring-black/5 group-hover:block">
            <ul className="space-y-2">
              {navItem.subItems.map((subItem) => (
                <li key={subItem.id}>
                  <a 
                    href={subItem.href}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="font-medium">{subItem.title}</div>
                    <div className="text-muted-foreground">{subItem.description}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
      
      {/* Static links */}
      {content.navigation.static.map((item) => (
        <li key={item.id}>
          <a 
            href={item.path}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:text-accent-foreground"
          >
            {item.icon}
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

type NavbarProps = React.ComponentPropsWithoutRef<"header"> & Partial<Content>;

export const NavbarMegaMenu = (props: NavbarProps) => {
  const { actions } = {
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
          <DesktopNavigation />
          <div className="flex flex-1 items-center justify-end space-x-2">
            <MobileNavigation />
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
      <HeroSplit />
    </>
  );
};

const HeroSection = () => (
  <section className="w-full py-16 lg:py-32">
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex flex-col text-center gap-8 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="max-w-2xl text-3xl md:text-4xl lg:text-6xl font-bold">
            How do use the navbar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Content Hero
          </p>
        </div>
      </div>
    </div>
  </section>
);