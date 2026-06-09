"use client";

import { Suspense, type ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "@bigcommerce/big-design";
import { theme as bigDesignTheme } from "@bigcommerce/big-design-theme";
import { StyledComponentsRegistry } from "@/lib/styled-components-registry";

/**
 * Client-side provider boundary for BigDesign. Wires up the styled-components
 * SSR registry, the BigDesign theme, and the global styles (base typography +
 * normalize.css). Server components passed as `children` stay on the server.
 *
 * With Cache Components enabled, the registry still wraps the whole tree so
 * style collection is unchanged, but `children` is wrapped in Suspense. That
 * boundary lets Next split the static prerendered shell (chrome + styles) from
 * the dynamic, server-streamed page content (pages that await params/data).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={bigDesignTheme}>
        <GlobalStyles />
        <Suspense>{children}</Suspense>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
