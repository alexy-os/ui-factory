import type { ButtonProps } from "@/source/ui/Button";
import type { BadgeProps } from "@/source/ui/Badge";

// Base content type that can be extended by specific hero components
export interface BaseHeroContent {
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
} 