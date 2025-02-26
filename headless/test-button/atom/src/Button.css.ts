import { style } from "@vanilla-extract/css";

// Base style for the button - minimal styling
export const buttonBaseStyle = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  userSelect: "none",
  fontFamily: "inherit",
  fontWeight: "inherit",
  transition: "all 0.2s ease-in-out",
  // Reset button styles
  background: "transparent",
  border: "none",
  margin: 0,
  padding: 0,
  "::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
  }
}); 