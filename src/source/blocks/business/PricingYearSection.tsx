import { ArrowRight, CircleCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/source/ui/Button";
import {
  Card,
  CardBody,
  CardFoot,
  CardHead,
  CardHeading,
} from "@/source/ui/Card";
import { useState } from "react";

type Content = {
  title: string;
  description: string;
  plans: {
    id: string;
    name: string;
    description: string;
    monthlyPrice: string;
    yearlyPrice: string;
    features: string[];
    buttonText: string;
    buttonVariant: ButtonProps['variant'];
  }[];
};

const content: Content = {
  title: "Pricing",
  description:
    "Choose the perfect plan for your needs, whether you're an individual or a team.",
  plans: [
    {
      id: "free",
      name: "Free",
      description: "Ideal for personal use and exploring the basics of our design system.",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        "Access to all free components",
        "Basic support",
        "Community access",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
    },
    {
      id: "premium",
      name: "Premium",
      description: "Perfect for professionals looking for advanced features.",
      monthlyPrice: "$249",
      yearlyPrice: "$224/year",
      features: [
        "Everything in Free",
        "Premium component library",
        "Priority support",
        "Early access to new features",
      ],
      buttonText: "Get Premium",
      buttonVariant: "default",
    },
    {
      id: "team",
      name: "Team",
      description: "Tailored for teams seeking collaborative tools.",
      monthlyPrice: "$459",
      yearlyPrice: "$413/year",
      features: [
        "Everything in Premium",
        "Team collaboration tools",
        "Dedicated support",
        "Custom component requests",
      ],
      buttonText: "Get Team Plan",
      buttonVariant: "default",
    },
  ],
} as const;

type PricingYearSectionProps = React.ComponentPropsWithoutRef<"section"> & Partial<Content>;

export const PricingYearSection = (props: PricingYearSectionProps) => {
  const { title, description, plans } = {
    ...content,
    ...props
  };

  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="w-full py-16 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <header className="flex flex-col gap-4">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold">
              {title}
            </h2>
            <p className="text-muted-foreground lg:text-xl max-w-2xl">
              {description}
            </p>
          </header>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Monthly</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsYearly(!isYearly)}
              className="px-6"
            >
              {isYearly ? "Switch to Monthly" : "Switch to Yearly"}
            </Button>
            <span className="text-sm font-medium">Yearly (-10%)</span>
          </div>
          <div className="flex flex-col items-stretch gap-6 md:flex-row">
            {plans?.map((plan) => (
              <Card key={plan.id} className="flex max-w-80 flex-col justify-between text-left">
                <CardHead>
                  <CardHeading>
                    <p>{plan.name}</p>
                  </CardHeading>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <span className="text-4xl font-bold">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                </CardHead>
                <CardBody>
                  <div className="mb-6 border-b border-border" />
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CircleCheck className="w-4 h-4 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
                <CardFoot className="mt-auto">
                  <Button className="w-full" variant={plan.buttonVariant}>
                    {plan.buttonText}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFoot>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};