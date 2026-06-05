"use client";

import { useState, type ReactNode } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/**
 * Collects styled-components styles during server rendering and injects them
 * into the streamed HTML. This is the App Router equivalent of the Pages
 * Router `_document` + `ServerStyleSheet` setup, required because BigDesign is
 * built on styled-components.
 *
 * See: https://nextjs.org/docs/app/building-your-application/styling/css-in-js
 */
export function StyledComponentsRegistry({
  children,
}: {
  children: ReactNode;
}) {
  // Create the stylesheet only once, lazily, per request.
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // On the client, render children directly; the browser owns the stylesheet.
  if (typeof window !== "undefined") {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
