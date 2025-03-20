import type { ButtonProps } from "../../ui/Button";
import type { BadgeProps } from "../../ui/Badge";

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