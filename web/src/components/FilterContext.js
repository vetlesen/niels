"use client";

// This component is a simple wrapper since the actual filter context
// is handled by ThemeContext. We keep this for compatibility.
export default function FilterContext({ children }) {
  return <>{children}</>;
}
