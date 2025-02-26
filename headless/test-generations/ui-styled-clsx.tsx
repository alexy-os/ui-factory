// bun headless/test-generations/ui-styled-clsx.tsx
import styled from "styled-components";
import clsx from "clsx";
import React from "react";

// 🎨 Universal style mapping
const stylesMap = {
  button: {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-300 text-black hover:bg-gray-400",
    small: "px-2 py-1 text-sm",
    large: "px-6 py-3 text-lg",
  },
  badge: {
    primary: "bg-green-500 text-white px-2 py-1 rounded-full",
    secondary: "bg-yellow-300 text-black px-2 py-1 rounded-full",
    small: "text-xs",
    large: "text-lg",
  },
  card: {
    primary: "bg-white shadow-md border p-4",
    secondary: "bg-gray-100 shadow-sm border p-4",
    small: "max-w-sm",
    large: "max-w-lg",
  },
};

// 🔄 Function mapping attributes to classes
const attributesToClass = (component, { variant, size }) => {
  return clsx(
    component, // Base class (button, badge, card)
    variant ? `${component}-${variant}` : "",
    size ? `${component}-${size}` : ""
  );
};

// 🏗 Interface for UIComponent props
interface UIComponentProps {
  as?: React.ElementType;
  variant?: string;
  size?: string;
  componentType?: keyof typeof stylesMap;
  children?: React.ReactNode;
}

// 🏗 Universal Styled Component
const UIComponent = styled.div.attrs<UIComponentProps>(
  ({ 
    as: Component = "div", 
    variant, 
    size, 
    componentType = "div" 
  }) => ({
    className: clsx(
      attributesToClass(componentType, { variant, size }),
      stylesMap[componentType]?.[variant],
      stylesMap[componentType]?.[size]
    ),
    as: Component, // Allows dynamic tag change (a, div, button)
  }))<UIComponentProps>``;

// 🛠 Function for generating CSS with @apply
const generateCSS = (styles: Record<string, Record<string, string>>) => {
  let css = "";

  Object.keys(styles).forEach((component) => {
    css += `.${component} { @apply transition duration-200; }\n`;
    Object.keys(styles[component]).forEach((key) => {
      css += `.${component}-${key} { @apply ${styles[component][key]}; }\n`;
    });
  });

  return css;
};

// 🏗 Function for generating HTML
const generateHTML = (component, variant, size, text) => {
  const className = clsx(
    component,
    variant ? `${component}-${variant}` : "",
    size ? `${component}-${size}` : ""
  );

  return `<div class="${className}">${text}</div>`;
};

// 📌 Displaying automatically generated CSS
console.log("🔥 Generated CSS:");
console.log(generateCSS(stylesMap));

// 🚀 Displaying HTML code for different components
console.log("🔥 Generated HTML:");
console.log(generateHTML("button", "primary", "small", "Primary Small"));
console.log(generateHTML("badge", "secondary", "large", "Large Badge"));
console.log(generateHTML("card", "primary", "small", "Small Card"));

// 📌 Displaying the UI with the generated components
export default function App() {
  return (
    <div className="p-4 space-y-4">
      <UIComponent as="a" componentType="button" variant="primary" size="small">
        Primary Small
      </UIComponent>
      <UIComponent as="span" componentType="badge" variant="secondary" size="large">
        Large Badge
      </UIComponent>
      <UIComponent as="div" componentType="card" variant="primary" size="small">
        Small Card
      </UIComponent>
    </div>
  );
}