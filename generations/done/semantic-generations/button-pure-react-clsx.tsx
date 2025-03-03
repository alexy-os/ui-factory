// bun generations/semantic-generations/button-pure-react-clsx.tsx
import clsx from "clsx";
import ReactDOMServer from 'react-dom/server';

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

const Button = ({ variant, size, children, ...props }) => {
  const className = clsx(
    buttonAttributesToClass({ variant, size }),
    buttonStyles[variant],
    buttonStyles[size]
  );
  
  return (
    <a 
      className={className}
      href="#"
      role="button"
      type="button"
      variant={variant}
      {...props}
    >
      {children}
    </a>
  );
};

const generateCSS = (styles) => {
  let css = `.button { @apply font-medium rounded-md transition duration-200; }\n`;

  for (const key in styles) {
    css += `.button-${key} { @apply ${styles[key]}; }\n`;
  }

  return css;
};

console.log(generateCSS(buttonStyles));

function App() {
  return (
    <div className="p-4 space-x-4">
      <Button variant="primary" size="small">Primary Small</Button>
      <Button variant="secondary" size="large">Secondary Large</Button>
    </div>
  );
}

console.log(ReactDOMServer.renderToString(<App />));