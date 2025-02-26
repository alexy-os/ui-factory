import styled from "styled-components";
import clsx from "clsx";

const buttonStyles = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-300 text-black hover:bg-gray-400",
  small: "px-2 py-1 text-sm",
  large: "px-6 py-3 text-lg",
};

const buttonAttributesToClass = ({ variant, size }) => {
  return clsx(
    "button",
    variant ? `button-${variant}` : "",
    size ? `button-${size}` : ""
  );
};

interface ButtonProps {
  variant?: string;
  size?: string;
  children?: React.ReactNode;
}

const Button = styled.a.attrs(({ variant, size }: ButtonProps) => ({
  className: clsx(
    buttonAttributesToClass({ variant, size }),
    buttonStyles[variant ?? ""],
    buttonStyles[size ?? ""]
  ),
  href: "#",
  role: "button",
  type: "button"
}))``;

const generateCSS = (styles) => {
  let css = `.button { @apply font-medium rounded-md transition duration-200; }\n`;

  for (const key in styles) {
    css += `.button-${key} { @apply ${styles[key]}; }\n`;
  }

  return css;
};

const generateHTML = (variant, size, text) => {
  const className = clsx(
    "button",
    variant ? `button-${variant}` : "",
    size ? `button-${size}` : ""
  );

  return `<a href="#" role="button" type="button" class="${className}">${text}</a>`;
};

console.log("🔥 Generated CSS:");
console.log(generateCSS(buttonStyles));

console.log("🔥 Generated HTML:");
console.log(generateHTML("primary", "small", "Primary Small"));
console.log(generateHTML("secondary", "large", "Secondary Large"));

{/*export default function App() {
  return (
    <div className="p-4 space-x-4">
      <Button variant="primary" size="small">Primary Small</Button>
      <Button variant="secondary" size="large">Secondary Large</Button>
    </div>
  );
}*/}