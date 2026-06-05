"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "@bigcommerce/big-design";
import { theme as bigDesignTheme } from "@bigcommerce/big-design-theme";
import { StyledComponentsRegistry } from "@/lib/styled-components-registry";

/**
 * Client-side provider boundary for BigDesign. Wires up the styled-components
 * SSR registry, the BigDesign theme, and the global styles (base typography +
 * normalize.css). Server components passed as `children` stay on the server.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={bigDesignTheme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
